import { useEffect, useState } from "react";
import { Video } from "video-metadata-thumbnails";
import "./VideoMetaData.css";

const VideoMetaData = ({ video }) => {
  const [data, setData] = useState();

  const secondsToMinutes = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes and ${Math.trunc(remainingSeconds)} seconds`;
  };

  const bytesToSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  useEffect(() => {
    if (video) {
      (async () => {
        try {
          const video1 = new Video(URL.createObjectURL(video));
          const vData = await video1.getMetadata();
          setData(() => vData);
        } catch (e) {
          console.log(e);
        }
      })();
    }
  }, [video]);

  return (
    <>
      {video && (
        <div className="videometadata_cont">
          <h4>Title: {video?.name}</h4>
          <h4>Type: {video.type}</h4>
          <h4>Size: {bytesToSize(video.size)}</h4>
          <h4>Duration: {secondsToMinutes(data?.duration)}</h4>
          <h4>Original width: {data?.width}px</h4>
          <h4>Original height: {data?.height}px</h4>
          <h4>
            Last Modified: {new Date(video.lastModified).toLocaleString()}
          </h4>
        </div>
      )}
    </>
  );
};

export default VideoMetaData;
