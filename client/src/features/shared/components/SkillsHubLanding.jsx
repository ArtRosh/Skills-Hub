import React, { useEffect } from "react";
import "./SkillsHubLanding.css";

function SkillsHubLanding() {
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
      <div className="site-title-container">
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
            <li>Create an account</li>
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
            <button className="start-btn">Go to Topics</button>
        </div>

        </div>
    </>
  );
}

export default SkillsHubLanding;