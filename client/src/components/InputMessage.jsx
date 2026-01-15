import React, { useRef, useState } from "react";
import { IoMdAdd, IoMdSend } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { sendMessageThunk } from "../store/chatSlice.js";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { CiCircleRemove } from "react-icons/ci";
import { toast } from "sonner";
import { sendRoomMessageThunk } from "../store/groupSlice.js";

const InputMessage = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [textMesage, setTextMesage] = useState("");
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();

  const selectedUser = useSelector((state) => state.chat.selectedUser);

  const messagesLoading = useSelector((state) => state.chat.messagesLoading);
  const selectedGroup = useSelector((state) => state.groups.selectedGroup);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const receiverId = selectedUser?._id;

      if (textMesage && textMesage.trim() !== "") {
        formData.append("text", textMesage);
      }

      if (file) {
        formData.append("image", file);
      }

      if (!textMesage && !file) {
        console.log("No se mandaron datos");
        return;
      }

      dispatch(
        sendMessageThunk({
          receiverId: receiverId,
          data_body: formData,
        })
      )
        .unwrap()
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
          console.log(error.message);
          toast(`${error.message}`, {
            style: {
              background: "red",
              color: "white",
              position: "top-center",
            },
          });
        });

      setTextMesage("");
      if (preview != null) {
        setPreview(null);
        setFile(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGroupSumbit = (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      const groupId = selectedGroup?._id;

      if (textMesage && textMesage.trim() !== "") {
        formData.append("text", textMesage);
      }

      if (file) {
        formData.append("image", file);
      }

      if (!textMesage && !file) {
        console.log("No se mandaron datos");
        return;
      }

      dispatch(
        sendRoomMessageThunk({
          groupId: groupId,
          body: formData,
        })
      )
        .unwrap()
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
          console.log(error.message);
          toast(`${error.message}`, {
            style: {
              background: "red",
              color: "white",
              position: "top-center",
            },
          });
        });

      setTextMesage("");
      if (preview != null) {
        setPreview(null);
        setFile(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  let wich = null;

  if (selectedGroup?._id) {
    wich = handleGroupSumbit;
  } else if (selectedUser?._id) {
    wich = handleSubmit;
  }

  return (
    <div className="w-full p-1.5">
      {preview && (
        <div className="mx-3 relative p-4 w-max">
          <img
            src={preview}
            className="rounded-md bg-cover bg-center bg-no-repeat w-15 h-15 
            md:w-23 
            md:h-23"
            alt="preview"
          />

          <button
            className="
            absolute top-1 right-1
            bg-base-100 rounded-full w-8 h-8 mx-auto flex items-center justify-center hover:bg-base-100/50 hover:cursor-pointer
            font-bold text-primary
            "
            onClick={() => {
              setPreview(null);
            }}
          >
            <CiCircleRemove size={30} className="" />
          </button>
        </div>
      )}
      <form
        action=""
        onSubmit={wich}
        className="
        flex items-center
        "
      >
        <div className="flex flex-1 gap-3.5">
          <input
            type="text"
            name="text"
            className="w-full focus:outline-none
              rounded-lg
              border-b-1 focus:border-primary
            "
            value={textMesage}
            onChange={(e) => {
              setTextMesage(e.target.value);
            }}
            placeholder="Escribe un mensaje"
            id="text"
          />

          <input
            type="file"
            name="image"
            max={1}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
          />

          <button
            className="w-6 h-6  border-1 rounded-sm
            hover:cursor-pointer transition-colors hover:bg-accent-content hover:text-accent
            "
            type="button"
            onClick={handleImageClick}
          >
            <IoMdAdd className="mx-auto" />
          </button>

          <button
            type="submit"
            className="w-6 h-6  border-1 rounded-sm
          hover:cursor-pointer transition-colors hover:bg-accent-content hover:text-accent
          "
          >
            {messagesLoading ? (
              <AiOutlineLoading3Quarters className="mx-auto" />
            ) : (
              <IoMdSend className="mx-auto" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputMessage;
