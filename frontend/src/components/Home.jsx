import React, { useState, useEffect } from "react";
import "./Home.css";
import UploadEventForm from "./UploadEventForm";

const Home = ({ showUploadForm, addEvent, onClose }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      setRotation((prevRotation) => prevRotation + 0.2);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="home-container">
      <div className="top-content">
        <h2>
          <span>🔥 Winners Never Quit</span> & <span>Quitters Never Win</span>
        </h2>
        <p>Discover and participate in exciting tournaments around you!</p>
      </div>

      <div className="bottom-content">
        {showUploadForm ? (
          <UploadEventForm addEvent={addEvent} onClose={onClose} />
        ) : (
          <div className="circle-carousel-container">
            <div
              className="circle-carousel"
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              <div className="carousel-item">
                <img src="/images/kabaddi.jpg" alt="Kabaddi" />
              </div>
              <div className="carousel-item">
                <img src="/images/vollyball.png" alt="Volleyball" />
              </div>
              <div className="carousel-item">
                <img src="/images/NcZXHD.jpg" alt="Cricket" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
