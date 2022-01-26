import { CountdownCircleTimer } from "react-countdown-circle-timer";

const renderTime = ({ remainingTime }) => {
  if (remainingTime === 0) {
    return <div className="timer"> <h3 style={{color:'#aaa'}}>Time's up!</h3></div>;
  }

  return (
    <div className="timer">
      <div style={{fontSize:'40px',color:'white'}}>{remainingTime}</div>
      <div style={{color:'#aaa'}}>seconds</div>
    </div>
  );
};

const Clock = ({clockKey, timeLimit}) => {
    return (
        <div className="timer-wrapper">
            <CountdownCircleTimer
                key={clockKey}
                isPlaying
                duration={timeLimit}
                colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                colorsTime={[timeLimit, timeLimit*0.6, timeLimit*0.3, 0]}
                >
                {renderTime}
            </CountdownCircleTimer>
        </div>
    )
};

export default Clock;