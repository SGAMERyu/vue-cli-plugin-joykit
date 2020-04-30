module.exports = [
  {
    type: 'list',
    name: 'addComposition',
    message: 'Do you want to add composition-api in your project',
    choices: ['composition-plugin', 'composition', 'no-composition']
  },
  {
    type: 'confirm',
    name: 'addCommitMessage',
    message: 'Do you want to add commit message template?'
  }
]