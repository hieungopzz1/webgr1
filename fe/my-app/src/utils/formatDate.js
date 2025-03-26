/**
 * Định dạng ngày tháng trong ứng dụng
 */

/**
 * Định dạng ngày thành dd/MM/yyyy
 * @param {Date|string|number} date - Ngày cần định dạng
 * @returns {string} Chuỗi ngày dạng dd/MM/yyyy
 */
export const formatShortDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng ngày thành dd tháng MM, yyyy
 * @param {Date|string|number} date - Ngày cần định dạng
 * @returns {string} Chuỗi ngày dạng "dd tháng MM, yyyy"
 */
export const formatLongDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  
  return `${day} tháng ${month}, ${year}`;
};

/**
 * Định dạng thời gian thành HH:mm
 * @param {Date|string|number} date - Ngày cần định dạng
 * @returns {string} Chuỗi thời gian dạng HH:mm
 */
export const formatTime = (date) => {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Định dạng ngày giờ đầy đủ
 * @param {Date|string|number} date - Ngày cần định dạng
 * @returns {string} Chuỗi dạng "HH:mm - dd/MM/yyyy"
 */
export const formatDateTime = (date) => {
  return `${formatTime(date)} - ${formatShortDate(date)}`;
};

/**
 * Định dạng thời gian tương đối (vừa xong, 5 phút trước, v.v.)
 * @param {Date|string|number} date - Ngày cần định dạng
 * @returns {string} Chuỗi mô tả thời gian tương đối
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now - d) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  return formatShortDate(date);
};
