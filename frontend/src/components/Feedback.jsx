import React, { useEffect, useState } from "react";
import "./Feedback.css";

const feedbacks = [
  { name: "Rahul", text: "Found local football tournaments easily and registered my team in minutes." },
  { name: "Abhi", text: "Loved the clean UI for booking practice slots and checking leaderboards." },
  { name: "Amit", text: "Live fixtures and result updates kept our cricket team on track all season." },
  { name: "Kiran", text: "Great platform to discover badminton events around the city." },
  { name: "Rupesh", text: "Team management made coordinating players and timings super easy." },
  { name: "Ravi", text: "Player profiles and stats helped me showcase my performance to selectors." },
  { name: "manoj", text: "Tournament brackets and schedules were clear and always up to date." },
  { name: "Subba", text: "Community events helped me join a weekend basketball league nearby." },
  { name: "Manish", text: "Cricket scoring and match summaries are accurate and easy to share." },
  { name: "Ananya", text: "Best app for college sports announcements and quick registrations." },
];

const TypewriterCard = ({ text, name }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setShowName(false);
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        setShowName(true);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, [text]);

  return (
    <div className="feedback-card">
      <p className="feedback-text">
        “{displayedText}”<span className="cursor"></span>
      </p>
      {showName && <h4 className="feedback-name">- {name}</h4>}
    </div>
  );
};

const Feedback = () => {
  const [indexes, setIndexes] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexes((prev) => [
        (prev[0] + 3) % feedbacks.length,
        (prev[1] + 3) % feedbacks.length,
        (prev[2] + 3) % feedbacks.length,
      ]);
    }, 5000); // Change all cards every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="feedback-section">
      <h2>What Our Users Say</h2>
      <div className="feedback-row">
        {indexes.map((feedbackIndex, i) => (
          <TypewriterCard
            key={i}
            text={feedbacks[feedbackIndex].text}
            name={feedbacks[feedbackIndex].name}
          />
        ))}
      </div>
    </section>
  );
};

export default Feedback;
