import React from "react";
import "./Notification.css";

const Notification = ({ message, type = "info" }) => {
  return (
    <div className={`notification notification--${type}`}>
      <p>{message}</p>
    </div>
  );
};

export default Notification;