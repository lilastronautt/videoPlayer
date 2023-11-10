import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import VideoToAudio from "video-to-audio";
import VideoPlayer from "./components/VideoPlayer/VideoPlayer";
import VideoWaveSurfer from "./components/VideoWaveSurfer/VideoWaveSurfer";
import Notifications from "./components/Notifications/Notifications";
import Loader from "./components/Loader/Loader";
import Backdrop from "./components/Backdrop/Backdrop";
import Modal from "./components/Modal/Modal";
import "./App.css";

const App = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [loader, showLoader] = useState(false);
  const [showNotifications, setShowNotifiations] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [audio, setAudio] = useState("");
  const [videoState, setVideoState] = useState(false);
  const [seekTime, setSeekTime] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const videoRef = useRef();

  // function to reload the page when user wants to upload another filewhile preexisting one
  const ok = () => {
    window.location.reload();
  };

  // shuts the modal off
  const cancel = () => {
    setShowModal(() => false);
  };

  // show the modal for when user user want to upload the new file while preexisting one
  const newFileHandler = () => {
    setShowModal(() => true);
    setModalMsg(() => [
      "Inorder to upload new video,we'll have to reload the page",
    ]);
  };

  const videoInputHandler = async (files) => {
    const video = files[0];
    showLoader(true);

    if (video && video.type.startsWith("video/")) {
      const videoDummy = videoRef.current;
      let hasAudioP = false; // stores the value of the result of video ka audio detector
      videoDummy.src = URL.createObjectURL(video);
      // checking wheter the video has audio or not
      videoDummy.onloadedmetadata = async () => {
        await videoDummy.play();
        videoDummy.volume = 0.01; // inorder to check video will run so shut the music video off

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(videoDummy);
        const analyser = audioContext.createAnalyser();
        const gainNode = audioContext.createGain();

        source.connect(analyser);
        analyser.connect(gainNode);
        gainNode.connect(audioContext.destination);

        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const hasAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, value) => a + value, 0);
          return sum > 0;
        };

        videoDummy.addEventListener("timeupdate", async () => {
          if (!hasAudioP) {
            if (hasAudio()) hasAudioP = true;
          }
        });
      };

      // leeting the video play for some and then pausing inorder to analyze the audio correctly
      setTimeout(async () => {
        videoDummy.pause();
        if (hasAudioP) {
          try {
            // extracting audio for wavesurfer
            let audioFileMp3 = await VideoToAudio.convert(video, "mp3");
            setAudio(audioFileMp3);
            setVideoFile(video);
            setMsg("Video uploaded successfully");
            setError(false);
            setShowNotifiations(true);
            setTimeout(() => {
              setShowNotifiations(false);
            }, 3500);
            showLoader(false);
          } catch (error) {
            console.error("Error extracting audio:", error);
          }
        } else {
          setMsg("Video doesn't have audio, select another,reloading...");
          showLoader(false);
          setError(true);
          setShowNotifiations(true);
          setTimeout(() => {
            window.location.reload();
            setShowNotifiations(false);
          }, 3500);
        }
      }, 3000);
    } else {
      setMsg("Please select a video file");
      setError(true);
      setShowNotifiations(true);
      setTimeout(() => {
        setShowNotifiations(false);
      }, 3500);
      showLoader(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: videoInputHandler,
  });

  // fxn for wavesurfer for correctly handling the surfer state in accordance with video state
  const getVideoPlayingState = (state) => {
    setVideoState(state);
  };
  // fxn for wavesurfer for correctly handling the seektime in accordance with video
  const getSeekTime = (time) => {
    setSeekTime(time);
  };

  const helpHandler = () => {
    setShowModal(() => true);
    setModalMsg(() => [
      "1) Upload a video with audio.",
      "2) To upload a new video while another is playing, click 'OK' to reload the page before selecting a different file.",
      "3) Utilize the seek feature to adjust the video duration.",
      "4) Examine the audio waveform for a detailed representation of the sound in the video.",
      "5) Control video playback using screen clicks or the space bar.",
      "6) Access the website on your mobile browser for a seamless experience.",
    ]);
  };

  return (
    <div className="video_main__cont">
      {!videoFile && (
        <div {...getRootProps()} className="video_input__btn">
          <input {...getInputProps()} />
          {loader
            ? ""
            : videoFile?.name
            ? videoFile.name
            : "Browse or drop video"}
          {loader && <Loader dimension={2} />}
        </div>
      )}
      {videoFile && (
        <button className="video_input__btn" onClick={newFileHandler}>
          Upload new
        </button>
      )}
      <VideoPlayer
        videoUrl={videoFile && URL.createObjectURL(videoFile)}
        getState={getVideoPlayingState}
        getSeekTime={getSeekTime}
        name={videoFile?.name}
      />
      <VideoWaveSurfer
        audioSrc={audio && audio.data}
        videoState={videoState}
        time={seekTime}
        video={videoFile}
      />
      <Notifications
        msg={msg}
        showNotifications={showNotifications}
        error={error}
      />
      <video ref={videoRef} style={{ display: "none" }}></video>
      {showModal && (
        <>
          <Modal msg={modalMsg} ok={ok} cancel={cancel} /> <Backdrop />
        </>
      )}
      <button className="help_btn" onClick={helpHandler}>
        Help
      </button>
    </div>
  );
};

export default App;
