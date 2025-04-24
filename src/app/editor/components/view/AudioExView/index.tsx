/* eslint-disable @next/next/no-img-element */
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FC, useState } from "react";
import { Card } from "@nextui-org/react";
import { TAudioData } from "../../editor/Audio/types";
import "./styles.scss";
import { getImageNameFromPath } from "../../editor/mappers";
import ScriptIcon from "@/assets/icons/audio_script_icon.svg";
import ScriptCloseIcon from "@/assets/icons/audio_script_close_icon.svg";
import Image from "next/image";
type TProps = {
  data: TAudioData;
  isPreview?: boolean;
};

export const AudioExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];

  const audioFile = data?.editorImages?.[0]?.file || data.editorImages?.[0];
  const audioFileName =
    audioFile?.name || getImageNameFromPath(audioFile?.path) || "";
  const [scriptIsVisible, setScriptIsVisible] = useState(false);
  return (
    <>
      <div className={`py-8 w-[886px] m-auto`}>
        <p
          style={{
            color: data.titleColor,
            fontSize: 38,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.title}
        </p>
        <p
          style={{
            fontSize: 24,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.subtitle}
        </p>
        {!!data.description && (
          <p
            style={{
              fontSize: 20,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {data.description}
          </p>
        )}
      </div>
      <div
        className={`py-8 w-[886px] m-auto`}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
        {!!audioFileName && (
          <div style={{ margin: "0 auto" }} className="flex flex-col gap-10">
            <Card radius="md" className="p-4">
              <p
                className="text-center"
                style={{ fontWeight: 500, color: "#3F28C6" }}
              >
                {data.audioTitle || audioFileName}
              </p>
              <div className={`audio-wrapper my-4`}>
                <AudioPlayer
                  src={audioFile.dataURL || URL.createObjectURL(audioFile)}
                  customAdditionalControls={[
                    <div key={1}>
                      <div
                        onClick={() => setScriptIsVisible((s) => !s)}
                        style={{ cursor: "pointer" }}
                      >
                        {scriptIsVisible ? (
                          <Image
                            src={ScriptCloseIcon}
                            alt="toggle script icon"
                          />
                        ) : (
                          <Image src={ScriptIcon} alt="toggle script icon" />
                        )}
                      </div>
                    </div>,
                  ]}
                />
              </div>
              {scriptIsVisible && (
                <div>
                  <p className="my-2">Скрипт</p>
                  <Card
                    radius="md"
                    shadow="none"
                    className="p-4"
                    style={{ border: "1px solid #3F28C6" }}
                  >
                    {data.audioDescription}
                  </Card>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};
