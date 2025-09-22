"use client";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export const ToastWrapper = () => {
  return (
    <ToastContainer position="bottom-left" autoClose={5000} theme="dark" />
  );
};
