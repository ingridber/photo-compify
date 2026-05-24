import { useEffect, useState, useRef, useMemo } from "react";
import { fetchCompetitions } from "../../services/api";
import styles from "./landingpage.module.css";
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";
import type {Competition} from "../../types/competitions";

export default function LandingPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]); // Stores fetched competitions
  const [index, setIndex] = useState(0); // Current active slide index
  const [fade, setFade] = useState(true); // Controls fade animation state

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // Stores autoplay interval reference

  const navigate = useNavigate();
  const {user} = useUser();
   const goTo = (path: string) => {
    navigate(path);
  };

  // Fetching data from backend, 5 competitions currently in voting stage
  useEffect(() => {
    async function load() {
      const res = await fetchCompetitions({
        limit: 5,
        status: "submission",
      });

      setCompetitions(res.competitions);
    }

    load();
  }, []);

  const topCompetitions = useMemo( // Memoize derived data to avoid recalculation on every render
    () => competitions.slice(0, 3), // Take only top 3 competitions
    [competitions] // Recalculate only when competitions change
  );

  const startAutoplay = () => { // Function to start automatic slideshow
    stopAutoplay(); // Ensure no existing interval is running

    intervalRef.current = setInterval(() => { // Start interval loop
      setFade(false); // Trigger fade-out animation

      setTimeout(() => { // Wait for fade-out before changing slide
        setIndex((prev) => { // Update slide index
          const next = (prev + 1) % topCompetitions.length; // Loop back to 0 at end
          return next; // Return new index
        });
        setFade(true); // Trigger fade-in animation
      }, 200); // Delay for fade transition
    }, 4000); // Change slide every 4 seconds
  };

  const stopAutoplay = () => { // Function to stop autoplay
    if (intervalRef.current) { // Check if interval exists
      clearInterval(intervalRef.current); // Clear interval
      intervalRef.current = null; // Reset reference
    }
  };

  useEffect(() => { // Handles autoplay lifecycle
    if (!topCompetitions.length) return; // Exit if no data

    startAutoplay(); // Start slideshow

    return () => stopAutoplay();
  }, [topCompetitions.length]); 

  if (topCompetitions.length === 0) return null;

  const current = topCompetitions[index];

  return (
    <div
      className={styles.container}
      onMouseEnter={stopAutoplay} // Pause autoplay when hovering
      onMouseLeave={startAutoplay} // Resume autoplay when leaving
    >

      <h1><span>Welcome</span>{`${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>

      {/* BOX */}
      <div className={styles.box}
      
        onClick={() => navigate(`/competitions/${current._id}`)}
        style={{ cursor: "pointer" }}
        >
        <div
          className={`${styles.content} ${fade ? styles.fadeIn : styles.fadeOut}`}
        >
          {current.logoBanner ? (
            <img
              src={current.signedLogoUrl}
              alt={current.title}
              className={styles.image}
            />
          ) : (
            <h2 className={styles.title}>{current.title}</h2> // Fallback if no image
          )}
        </div>
      </div>

      {/* DOTS */}
      <div className={styles.dots}>
        {topCompetitions.map((_, i) => (
          <div
            key={i}
            onClick={() => {
              setFade(false);

              setTimeout(() => {
                setIndex(i);
                setFade(true);
              }, 150);
            }}
            className={`${styles.dot} ${
              i === index ? styles.activeDot : ""
            }`}
          />
        ))}
      </div>

      {/* Button to competitionPage*/}
      <button
        onClick={() => navigate("/competitions")} 
        className={styles.competitionButton}
      >
        Explore all competitions
      </button>

        
  {!user ? (
    <>
      <h2 className={styles.hostComp}>
        Want to HOST or JOIN a competition?
      </h2>
      <button onClick={() => goTo("/login")} className={styles.signupButton}>
        Sign up
      </button>
    </>
  ) : (
    <>
      <h2 className={styles.hostComp}>
        Create competition here!
      </h2>
      <button onClick={() => goTo("/create-competition")} className={styles.signupButton}>
        Create
      </button>
    </>
  )}
</div>
  );
}
