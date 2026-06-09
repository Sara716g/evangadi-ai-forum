import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./MyQuestions.module.css";
import Dashboard from "../Dashboard/Dashboard";
import axios from "axios"; 

function MyQuestions() {
  const [myQuestions, setMyQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the logged-in user's token from localStorage
        const token = localStorage.getItem("token");

        // Directly hitting the endpoint 
        const response = await axios.get(
          "http://localhost:3777/api/questions?mine=true",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Sending the token so the backend knows who "mine" refers to
            },
          },
        );

        // Safe handling of data fields depending on backend format
        if (response.data && Array.isArray(response.data)) {
          setMyQuestions(response.data);
        } else if (response.data && Array.isArray(response.data.questions)) {
          setMyQuestions(response.data.questions);
        } else {
          setMyQuestions([]);
        }
      } catch (err) {
        console.error("Error loading workspace topics:", err);
        setError("Failed to fetch questions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyQuestions();
  }, []);

  return (
    <div className={styles.workspace_container}>
      {/* 1. Header Card Box Layout */}
      <div className={styles.header_card}>
        <div className={styles.header_info}>
          <span className={styles.badge}>YOUR WORKSPACE</span>
          <h1 className={styles.title}>Your topics</h1>
          <p className={styles.description}>
            Only questions you created. Open one to read answers or add
            follow-ups. Rows use the same left accent as your threads on Home.
          </p>
        </div>
        <Link to="/questions/ask" className={styles.new_question_btn}>
          <span className={styles.plus_icon}>+</span> New question
        </Link>
      </div>

      {/* 2. Main Content Card Shell */}
      <div
        className={`${styles.content_card} ${!isLoading && !error && myQuestions.length > 0 ? styles.has_content : ""}`}
      >
        {/* Loading State Container */}
        {isLoading && (
          <div className={styles.state_wrapper}>
            <p className={styles.loading_text}>Loading your questions...</p>
          </div>
        )}

        {/* Error State Container */}
        {!isLoading && error && (
          <div className={styles.state_wrapper}>
            <div className={styles.error_box}>
              <p className={styles.error_text}>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State Container with explicit link back to ask page */}
        {!isLoading && !error && myQuestions.length === 0 && (
          <div className={styles.state_wrapper}>
            <div className={styles.empty_box}>
              <p className={styles.empty_text}>
                You have not asked any questions yet. Use{" "}
                <Link to="/questions/ask" className={styles.inline_link}>
                  Ask a Question
                </Link>{" "}
                in the sidebar to start.
              </p>
            </div>
          </div>
        )}

        {/* Populated List State Container */}
        {!isLoading && !error && myQuestions.length > 0 && (
          <div className={styles.questions_feed}>
            {myQuestions.map((question) => (
              <Dashboard
                key={question.question_id || question.id}
                question={question}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyQuestions;
