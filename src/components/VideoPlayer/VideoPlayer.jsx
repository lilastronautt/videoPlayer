import React, { useEffect, useRef, useState } from "react";
import play from "../../assets/play.png";
import pause from "../../assets/pause.png";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoUrl, getState, getSeekTime, name }) => {
  const canvasRef = useRef();
  const videoRef = useRef();
  const playPauseButtonRef = useRef();
  const seekBarRef = useRef();
  const [isPlaying, setIsPlaying] = useState(true); // Initialize as playing
  const [currentTime, setCurrentTime] = useState(0); // storing the time and then running it from there after pausing
  const [seekBarFillWidth, setSeekBarFillWidth] = useState("0%");
  const [gotVideoFile, setGotVideoFile] = useState(true); // to stop multiple rendering after video is playing

  const [controlReplaySeek, setControlReplaySeek] = useState(0); // multiple replay button click handler

  const videoReplayHandler = () => {
    if (videoRef.current) {
      getSeekTime((controlReplaySeek * 100 + 1) / 100);

      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setCurrentTime(() => 0);
      setIsPlaying((prev) => !prev);
      getState(() => isPlaying);
      setControlReplaySeek(() => (controlReplaySeek * 100 + 1) / 100);
    }
  };

  useEffect(() => {
    if (videoUrl && gotVideoFile) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const playVideo = () => {
        // clearing the canvas before playing again
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (videoRef.current && isPlaying) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(playVideo);
          // Update the seek bar fill width based on video progress
          setSeekBarFillWidth(
            () =>
              `${
                (videoRef.current.currentTime / videoRef.current.duration) * 100
              }%`
          );
        }
      };
      videoRef.current.src = videoUrl;

      playVideo();

      setGotVideoFile(() => false);
    }
  }, [videoUrl, gotVideoFile, currentTime, isPlaying, videoRef, canvasRef]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        // Pause the video and store the current time
        videoRef.current.pause();
        setCurrentTime(() => videoRef.current.currentTime);
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying((prev) => !prev);
    getState(isPlaying);
  };

  // Add event listener to handle space bar press
  useEffect(() => {
    const handleSpaceBarPress = (event) => {
      if (event.key === " ") {
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleSpaceBarPress);

    return () => {
      window.removeEventListener("keydown", handleSpaceBarPress);
    };
  }, [isPlaying, currentTime]);

  useEffect(() => {
    if (videoUrl && currentTime > 0) {
      videoRef.current.currentTime = currentTime;

      isPlaying ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [isPlaying, videoUrl, currentTime]);

  const handleSeek = (e) => {
    const seekBar = e.currentTarget;
    if (videoRef.current) {
      const clickX = e.nativeEvent.offsetX;
      const seekBarWidth = seekBar.clientWidth;
      const newTime = (clickX / seekBarWidth) * videoRef.current.duration;
      setCurrentTime(() => newTime);
      getSeekTime(newTime);
      videoRef.current.currentTime = newTime;
    }
  };

  // Function to format time in "00:00 mins" format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")} mins`;
  };

  return (
    <div className="video_player__cont">
      <canvas ref={canvasRef} width="620" height="360" />
      {videoUrl || (
        <div className="video_player__earlymsg">
          Upload a video with auido and let the magic unfold
        </div>
      )}
      {videoUrl && (
        <>
          <video
            ref={videoRef}
            autoPlay={isPlaying}
            style={{ display: "none" }}
          ></video>

          <div
            ref={playPauseButtonRef}
            className="play_pause__button"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <img src={pause} alt="Pause" />
            ) : (
              <img src={play} alt="Play" />
            )}
          </div>

          <div ref={seekBarRef} className="seek_bar" onClick={handleSeek}>
            <div
              className="seek_bar_fill"
              style={{
                width: seekBarFillWidth,
              }}
            ></div>
          </div>

          <section className="video_player_detailsCont">
            <h4 className="video_player__time">
              {formatTime(Math.trunc(videoRef.current?.currentTime))}
            </h4>
            <button onClick={videoReplayHandler} className="replay_btn">
              Replay
            </button>
          </section>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
