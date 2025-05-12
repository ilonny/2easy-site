"use client";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export const ToastWrapper = () => {
  return (
    <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />
  );
};
