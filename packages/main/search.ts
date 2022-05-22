const superagent = require('superagent');
const cheerio = require('cheerio');
const axios = require('axios').default;

interface SearchType {
  title: string;
  link: string;
  types: string[];
}

interface DetailType {
  link: string;
  text: string;
}

interface BookDataProps {
  bookName: string; 
  bookUrl: string; 
  bookId: string;
  bookPass?: string;
}


// 图书搜索
const searchUrl = `https://www.iyd.wang`;
// 网盘地址
const baseUrl = `https://webapi.ctfile.com`;

/**
 * 搜索图书列表
 * @param param0
 * @returns
 */
const search = async ({
    value,
    currentPage = 1,
}: {
    value: string;
    currentPage: number;
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await superagent.get(
                `${searchUrl}/page/${currentPage}/?s=${encodeURI(value)}`
            );
            const $ = cheerio.load(res.text);
            const breadcrumb = $('.breadcrumb').text();
            const page = breadcrumb.match(/\d+/g)[0];
            console.log('page', page);
            const article = $('#main').find('article');
            const array: SearchType[] = [];
            for (let i = 0; i < article.length; i++) {
                const title = $(article[i]).find('.entry-title').text();
                const link = $(article[i])
                    .find('.entry-title')
                    .find('a')
                    .attr('href');
                array.push({
                    title,
                    link,
                    types: [],
                });
            }

            return resolve({ data: array, page });
        } catch (err) {
            console.error(err);
            return reject(err);
        }
    });
};

// 搜索图书详情页
const searchDetail = async (link: string) => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await superagent.get(link);
            const $ = cheerio.load(res.text);
            const content = $('.single-content');
            const imgSrc = content
                .find('.wp-caption.aligncenter')
                .find('img')
                .attr('src');
            const tagP = content.find('blockquote').find('p');
            const array: DetailType[] = [];
            for (let i = 0; i < tagP.length; i++) {
                const link = $(tagP[i]).find('a').attr('href');
                const text = $(tagP[i]).find('a').text();
                array.push({ link, text });
            }
            // console.log('array', array);
            return resolve({ data: array, src: imgSrc });
        } catch (err) {
            console.error(err);
            return reject(err);
        }
    });
};

/**
 * 解析图书下载地址
 * @param param0
 */
const parseUrl = async ({ bookPass: pass, bookId: fileID }: BookDataProps) => {
    console.log('pass', pass);
    // const fileID = '18694317-580089343-d2bbec'; //文件ID，网址后的东西
    // const pass = '526663'; //文件密码
    const r = Math.random(); //随机一个小于1的小数
    const fileInfoUrl = `${baseUrl}/getfile.php?path=${
        pass ? 'f' : 'file'
    }&f=${fileID}&passcode=${pass}&token=false&r=${r}`;
    console.log('fileInfoUrl', fileInfoUrl);
    return new Promise(async (resolve, reject) => {
        try {
            // 获取文件相关信息
            const { data } = await axios({ url: fileInfoUrl, method: 'GET' });
            console.log('data', data.code, data.file);
            if (data.code === 200) {
                const { userid, file_id, file_chk } = data.file;
                // 获取文件真实路径
                const fileUrl = `${baseUrl}/get_file_url.php?uid=${userid}&fid=${file_id}&file_chk=${file_chk}&folder_id=0&mb=0&app=0&acheck=1&rd=${r}`;
                // console.log('fileUrl', fileUrl);
                // 获取文件下载地址
                const { data: resData } = await axios.get(fileUrl);
                // console.log('resData', resData);
                return resolve(resData);
            } else {
                return resolve({
                    code: data.file.code,
                    message: data.file.message,
                });
            }
        } catch (err) {
            console.error(err);
            return reject(err);
        }
    });
};

export { search, searchDetail, parseUrl };
