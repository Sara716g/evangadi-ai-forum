import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.firstName?.trim() || "";

  const welcomeLine = firstName
    ? `Good to see you, ${firstName}.`
    : "Welcome to the forum.";

  // -----------------------------
  // STATE
  // -----------------------------
  const [questions, setQuestions] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // FETCH QUESTIONS
  // -----------------------------
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/questions");

      console.log("Questions API:", res.data);

      setQuestions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // -----------------------------
  // SEARCH
  // -----------------------------
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/questions", {
        params: { search: query },
      });

      console.log("Search API:", res.data);

      setQuestions(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setError("Search failed");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // SAFE DATA
  // -----------------------------
  const safeQuestions = Array.isArray(questions) ? questions : [];

  // -----------------------------
  // STATS
  // -----------------------------
  const totalQuestions = safeQuestions.length;

  const totalReplies = safeQuestions.reduce(
    (sum, q) => sum + (q.answerCount || 0),
    0,
  );

  const unanswered = safeQuestions.filter(
    (q) => (q.answerCount || 0) === 0,
  ).length;

  const yours = safeQuestions.filter((q) => q.author?.id === user?.id).length;

  return (
    <div className={styles.contentBody}>
      {/* WELCOME SECTION */}
      <section className={styles.welcomeSection}>
        <span className={styles.breadcrumb}>FORUM HOME</span>

        <h2>{welcomeLine}</h2>

        <p>
          Start a topic, revisit your own threads, or skim the live feed. Search
          above works from any page once you are back on Home.
        </p>
      </section>

      {/* SEARCH */}
      <div className={styles.searchBox}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions..."
        />

        <button onClick={handleSearch}>Search</button>

        <button onClick={fetchQuestions}>Reset</button>
      </div>

      {/* QUICK ACTION CARDS */}
      <div className={styles.quickCardsGrid}>
        <div className={styles.actionCard}>
          <div className={`${styles.cardIcon} ${styles.iconOrange}`}>
            <i className="fa-regular fa-pen-to-square"></i>
          </div>

          <div className={styles.cardText}>
            <h3>New Question</h3>
            <p>Share context, errors, and what you already tried</p>
          </div>
        </div>

        <div className={styles.actionCard}>
          <div className={`${styles.cardIcon} ${styles.iconYellow}`}>
            <i className="fa-solid fa-bars-staggered"></i>
          </div>

          <div className={styles.cardText}>
            <h3>Your Topics</h3>
            <p>Filtered list of threads you authored</p>
          </div>
        </div>

        <div className={styles.actionCard}>
          <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
            <i className="fa-regular fa-bookmark"></i>
          </div>

          <div className={styles.cardText}>
            <h3>Knowledge Base</h3>
            <p>
              Course library, uploads, and retrieval-backed context for threads
            </p>
          </div>
        </div>
      </div>

      {/* SECTION CAPTION */}
      <p className={styles.sectionCaption}>
        Figures below describe the newest threads in this feed (up to 100 from
        the API).
      </p>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Questions</span>
          <span className={styles.statValue}>{totalQuestions}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Replies</span>
          <span className={styles.statValue}>{totalReplies}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Unanswered</span>
          <span className={styles.statValue}>{unanswered}</span>
        </div>

        <div className={styles.statBox}>
          <span className={styles.statLabel}>Yours</span>
          <span className={styles.statValue}>{yours}</span>
        </div>
      </div>

      {/* DISCUSSION FEED */}
      <div className={styles.discussionFeedContainer}>
        <div className={styles.feedHeader}>
          <div>
            <h3>Discussion Feed</h3>
            <p>Your threads use a slim left accent in this list</p>
          </div>

          <span className={styles.badgeOrange}>NEWEST THREADS</span>
        </div>

        {loading && <p>Loading questions...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && safeQuestions.length === 0 ? (
          <div className={styles.feedEmptyState}>
            <p>No questions found. Be the first to ask!</p>
          </div>
        ) : (
          <div className={styles.feedList}>
            {safeQuestions.map((q) => (
              <div key={q.questionHash || q.id} className={styles.feedItem}>
                <h4>{q.title}</h4>

                <p>
                  {q.content
                    ? `${q.content.slice(0, 120)}${
                        q.content.length > 120 ? "..." : ""
                      }`
                    : "No content available"}
                </p>

                <small>Replies: {q.answerCount || 0}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
