import React from 'react';
import { useInView } from 'react-intersection-observer';
import './About.css';

const TimelineItem = ({ date, title, icon, children }) => {
  // Move the hook back inside the item
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5, // Trigger when 50% of the item is visible
  });

  return (
    // Add the ref and conditional class back to the item
    <div ref={ref} className={`timeline-item ${inView ? 'is-visible' : ''}`}>
      <div className="timeline-icon">{icon}</div>
      <div className="timeline-content">
        <span className="timeline-date">{date}</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div id="about" className="about-timeline-container">
      <div className="about-timeline-header">
        <h1>The Story of Sports Club</h1>
        <p>From a simple idea to a global community.</p>
      </div>
      {/* Remove the ref and class from the main timeline div */}
      <div className="timeline">
        <TimelineItem date="2023" title="The Idea is Born" icon="💡">
          A group of passionate sports fans, tired of missing local games, sketch out an idea on a napkin. The goal: a single platform for every sporting event.
        </TimelineItem>
        <TimelineItem date="Early 2024" title="Launch Day" icon="🚀">
          After months of hard work, Sports Club officially launches. The platform features listings for over 1,000 events in our pilot city.
        </TimelineItem>
        <TimelineItem date="Mid 2024" title="Community Growth" icon="👥">
          We hit our first major milestone: 10,000 active users. The community's feedback becomes the driving force behind our updates.
        </TimelineItem>
        <TimelineItem date="Today" title="Expanding Horizons" icon="🌍">
          With a presence in over 50 cities, we continue to grow, innovate, and connect fans with the sports they love.
        </TimelineItem>
        <TimelineItem date="The Future" title="What's Next?" icon="🔮">
          We're exploring new frontiers, including VR live-streaming and AI-powered event recommendations, to build the future of sports fandom.
        </TimelineItem>
      </div>
    </div>
  );
};

export default About;
