import "./Modal.css";

const Modal = ({ msg, ok, cancel }) => {
  const okHandler = () => {
    ok();
  };

  const cancelHandler = () => {
    cancel();
  };
  return (
    <div className="modal_main">
      <div className="modal_cont">
        <ul>
          {msg.map((el, i) => {
            return <p key={i}>{el}</p>;
          })}
        </ul>
        <div className="modal_button_cont">
          {msg.length == 1 && <button onClick={okHandler}>ok</button>}
          <button onClick={cancelHandler}>cancel</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
