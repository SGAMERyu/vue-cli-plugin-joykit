const shell = require("shelljs");
const fs = require('fs');

const standardCommitConfig = {
  scripts: {
    commit: "git-cz",
  },
  config: {
    commitizen: {
      path: "cz-conventional-changelog",
    },
  },
  devDependencies: {
    commitizen: "^4.0.4",
    "cz-conventional-changelog": "^3.1.0",
  },
};

const customCommitConfig = {
  scripts: {
    commit: "git-cz",
  },
  config: {
    commitizen: {
      path: "cz-customizable",
    },
  },
  devDependencies: {
    commitizen: "^4.0.4",
    "cz-customizable": "^6.2.0",
  },
};

module.exports = (api, options, rootOptions) => {
  // 是否添加composition-api
  if (options.addComposition) {
    const { addComposition: type } = options;
    switch (type) {
      case "composition-plugin":
        api.extendPackage(
          {
            dependencies: {
              "@vue/composition-api": "^0.5.0",
            },
          },
          { prune: true }
        );
        api.injectImports(
          api.entryFile,
          "import VueCompositionApi from '@vue/composition-api';"
        );
        api.onCreateComplete(() => {
          const mainPath = api.resolve('./src/main.js');
          const contentMain = fs.readFileSync(mainPath, { encoding: "utf-8" });
          const lines = contentMain.split(/\r?\n/g).reverse();
          const lastImportIndex = lines.findIndex(line => line.match(/^import/));
          lines[lastImportIndex] += '\n\nVue.use(VueCompositionApi);';
          const newContentMain = lines.reverse().join("\n");
          fs.writeFileSync(mainPath, newContentMain, { encoding: "utf-8" });
          shell.exec("vue add eslint --config prettier --lintOn save");
        })
        break;
      case "composition":
        shell.exec("vue add vue-next");
      default:
        break;
    }
  }

  options.addCommitMessage
    ? api.extendPackage(standardCommitConfig)
    : api.extendPackage(customCommitConfig);

  addLint();
  api.render({ ".commitlintrc.js": "./template/.commitlintrc.js" });

  function addLint() {
    api.extendPackage({
      devDependencies: {
        "@commitlint/config-conventional": "^8.3.4",
        "@commitlint/cli": "^8.3.5",
        "lint-staged": "^10.0.2",
        husky: "^4.2.5",
      },
      husky: {
        hooks: {
          "commit-msg": "commitlint -e $HUSKY_GIT_PARAMS",
          "pre-commit": "lint-staged",
        },
      },
      "lint-staged": {
        "*.vue": ["eslint --fix"],
        "src/*.js": ["eslint --fix"],
        "src/*.ts": ["eslint --fix"],
      },
    })
  }
};
