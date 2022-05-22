/**
 * 获取实际的url路径
 * @param url string
 */
export const getDownloadUrl = (url: string): string[] => {
    const src = url.split('?url=')[1];
    const splitSrc = src.split('?p=');
    return splitSrc;
};
