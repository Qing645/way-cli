const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Inquirer = require('inquirer');
const ora = require('ora');
const api = require('./api/interface/index');
const util = require('util');
const downloadGitRepo = require('download-git-repo');
const figlet = require('figlet');

const cwd = process.cwd();


class Creator {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
  }
  //创建
  async create() {
    const isOverwrite = await this.handleDirectory();
    if (!isOverwrite) return;
    console.log('todo....');
    await this.getCollectRepo();
  }
  // 处理是否有相同目录
  async handleDirectory() {
    const targetDirectory = path.join(cwd, this.projectName);
    // 如果目录中存在了需要创建的目录
    if (fs.existsSync(targetDirectory)) {
      if (this.options.force) {
        await fs.remove(targetDirectory);
      } else {
        let { isOverwrite } = await new Inquirer.prompt([
          {
            name: 'isOverwrite',
            type: 'list',
            message: '是否强制覆盖已存在的同名目录？',
            choices: [
              {
                name: '覆盖',
                value: true
              },
              {
                name: '不覆盖',
                value: false
              }
            ]
          }
        ]);
        if (isOverwrite) {
          await fs.remove(targetDirectory);
        } else {
          console.log(chalk.red.bold('不覆盖文件夹，创建终止'));
          return false;
        }
      }
    };
    return true;
  }
  // 获取可拉取的仓库列表
  async getCollectRepo() {
    const loading = ora('正在获取模版信息...');
    loading.start();
    const { data: list } = await api.getRepoList(); //获取模板信息接口
    loading.succeed();
    // const collectTemplateNameList = list.filter(item => item.topics.includes('template')).map(item => item.name);
    const collectTemplateNameList = ['mp-fwwy#dev_shengji','mp-fwyzl#dev_sdyc'] //固定模板
    let { choiceTemplateName } = await new Inquirer.prompt([
      {
        name: 'choiceTemplateName',
        type: 'list',
        message: '请选择模版',
        choices: collectTemplateNameList
      }
    ]);
    console.log('选择了模版：' + choiceTemplateName);
    //下载仓库
    this.downloadTemplate(choiceTemplateName);
  }
  // 下载仓库
  async downloadTemplate(choiceTemplateName) {
    this.downloadGitRepo = util.promisify(downloadGitRepo);
    const templateUrl = `direct:https://test.tailingcloud.cn:8086/sop/${choiceTemplateName}`; //定义模板路径
    const loading = ora('正在生成模版...');
    loading.start();
    await this.downloadGitRepo(templateUrl, path.join(cwd, this.projectName),{ clone: true });
    loading.succeed();
    this.showTemplateHelp();//使用提示
  }
  // 模版使用提示
  showTemplateHelp() {
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.projectName)}`);
    console.log(`\r\n  cd ${chalk.cyan(this.projectName)}\r\n`);
    console.log("  npm install");
    console.log("  npm run dev\r\n");
    console.log(`
            \r\n
            ${chalk.green.bold(
      figlet.textSync("way", {
        font: "Standard",
        horizontalLayout: "full",
        verticalLayout: "default",
        width: 30,
        whitespaceBreak: true,
      })
    )}
        `)
  }
}

module.exports = async function (projectName, options) {
  const creator = new Creator(projectName, options);
  await creator.create();
}