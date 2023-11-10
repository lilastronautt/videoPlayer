import React, { useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import "./VideoWaveSurfer.css";
import VideoMetaData from "../VideoMetaData/VideoMetaData";

const VideoWaveSurfer = ({ audioSrc, videoState, time, video }) => {
  const wavesurferRef = useRef(null);
  const wavesurfer = useRef(null);

  // initialising and creating the wavesurfer
  useEffect(() => {
    if (audioSrc) {
      wavesurfer.current = WaveSurfer.create({
        container: wavesurferRef.current,
        waveColor: "grey",
        progressColor: "black",
        cursorColor: "transparent",
        barWidth: 3,
        barHeight: 1.7,
        interact: false,
      });

      wavesurfer.current.load(audioSrc);
      // mute the wavesurfer audio
      wavesurfer.current.setVolume(0);
      // start playing the wavesurfer as soon as it loads ie the default for videoplayer too
      wavesurfer.current.on("ready", () => {
        wavesurfer.current.play();
      });

      return () => {
        wavesurfer.current.destroy();
      };
    }
  }, [audioSrc]);

  // handling play/pause ie the state of the wavesurfer acc to videoplayer state using the value recieved from the videoplayer component
  useEffect(() => {
    if (wavesurfer.current) {
      if (videoState) {
        wavesurfer.current.pause();
      } else {
        wavesurfer.current.play();
      }
    }
  }, [videoState, time]);

  // handling the current time to seekto for wavesurfer using the value recieved from videoplayer component
  useEffect(() => {
    if (wavesurfer && (time || time == 0)) {
      if (time < 1) {
        time = 0;
      }
      let duration = wavesurfer.current.getDuration();
      // Ensure the seekTime is within the valid range
      const calculatedSeekTime = Math.min(time, duration);
      // ok this workd but idk how, when the video is replyed so as to seek the wavesurfer to 0 this isdone as duration can be zero and seektime can be infinite
      duration ||= 1;
      // Seek to the specified time as a fraction of the duration
      wavesurfer.current.seekTo(calculatedSeekTime / duration);
    }
  }, [time]);

  return (
    <>
      {audioSrc && <div ref={wavesurferRef} className="wavesurfer_cont"></div>}
      {audioSrc && <VideoMetaData video={video} />}
    </>
  );
};

export default VideoWaveSurfer;
