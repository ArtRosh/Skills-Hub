import React, { useEffect, useState } from "react";
import "./SkillsHubLanding.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"

const landingImages = [
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1600",
  "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579097380689-4351e0a200ed?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1569878766010-17bff0a1987d?q=80&w=930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

function SkillsHubLanding() {
  const navigate = useNavigate();
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    Promise.all(
      landingImages.map(
        (src) =>
          new Promise((resolve) => {
            const image = new Image();
            image.src = src;
            image.onload = resolve;
            image.onerror = resolve;
          })
      )
    ).then(() => {
      if (!isCancelled) {
        setImagesReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const titleElement = document.getElementById("skills-title");
    if (!titleElement) return;

    const titleText = titleElement.innerText;
    titleElement.innerText = "";

    for (let i = 0; i < titleText.length; i++) {
      const span = document.createElement("span");
      span.textContent = titleText[i];
      span.classList.add("handwriting");
      span.style.animationDelay = `${i * 0.25}s`;
      titleElement.appendChild(span);
    }
  }, []);

  return (
    <>
      <div className={`site-title-container ${imagesReady ? "is-ready" : ""}`}>
        <h1 id="skills-title">Skills Hub</h1>
      </div>

      <div className="skills-description">

        <div className="section-card">
          <h2>What is Skills Hub?</h2>
          <p>
            A platform where students request help and tutors provide services.
            Everything is organized through a simple request and approval workflow.
          </p>
        </div>

        <div className="section-card">
          <h2>Get Started</h2>
          <ol className="steps">
            <li>
            <Link to="/signup" className="inline-link">
                Create an account
            </Link>
            </li>
            <li>Choose your role (Student or Tutor)</li>
            <li>Browse topics or create a service</li>
            <li>Send or receive a request</li>
            <li>Start chatting after approval</li>
          </ol>
        </div>

        <div className="section-card two-columns">
          <div>
            <h3>For Students</h3>
            <ul>
              <li>Explore available topics</li>
              <li>Pick a tutor service</li>
              <li>Send a help request</li>
              <li>Wait for approval</li>
              <li>Chat with tutor</li>
            </ul>
          </div>

          <div>
            <h3>For Tutors</h3>
            <ul>
              <li>Create your services</li>
              <li>Receive requests</li>
              <li>Accept or reject</li>
              <li>Chat with students</li>
            </ul>
          </div>
        </div>

        <div className="section-card">
          <h2>Why Use It?</h2>
          <ul>
            <li>Clear request workflow</li>
            <li>Role-based system</li>
            <li>Real-time chat</li>
            <li>Simple and clean UI</li>
          </ul>
        </div>

        <div className="section-card action">
          <h2>Start Now</h2>
          <p>Join the platform and connect with tutors or students.</p>

          <div className="cta-buttons">
            <button
              className="start-btn"
              onClick={() => navigate("/")}
            >
              Go to Topics
            </button>

            
          </div>
        </div>

      </div>
    </>
  );
}

export default SkillsHubLanding;