const pad = (num) => {
  return num.toString().padStart(2, '0');
};

const generateFileNumber = () => {
     const now = new Date();
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());
  const fileNumber = `${year}${month}${day}${hour}${minute}${second}`;
    return fileNumber;
};

module.exports = { generateFileNumber };