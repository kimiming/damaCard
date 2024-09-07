function formatDate(isoDateString) {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 月份从0开始，需要加1
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0"); // 确保小时是两位数
  const minutes = String(date.getMinutes()).padStart(2, "0"); // 确保分钟是两位数

  return `${year}/${month}/${day}--${hours}:${minutes}`;
}

export default formatDate;
