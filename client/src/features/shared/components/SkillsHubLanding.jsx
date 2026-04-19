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
        <h2>About the Project</h2>
        <p>
          Skills Hub is a full-stack tutoring platform built with React and Flask.
          It allows users to create services, send requests, and manage workflows.
        </p>
      </div>
    </>
  );
}

export default SkillsHubLanding;