import {
    Button,
    Input,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@nextui-org/react";
import {FC, useEffect, useState} from "react";
import ChevronIconDown from "@/assets/icons/chevron_down.svg";
import Image from "next/image";
import {TField} from "./types";
import Close from "@/assets/icons/close.svg";


type TProps = {
    id: string;
    field: TField;
    onChangeFieldValue: (id: string, optionIndex: number, value: string) => void;
    onAddFieldOption: (id: string) => void;
    deleteOption: (id: string, optionIndex: number) => void;


    openPopover: { [key: string]: boolean };
    onOpen: (id: string) => void;
    onClose: (id: string) => void;
};

const PopoverInput = ({
                          onBlur,
                          initialValue,
                      }: {
    onBlur: (val: string) => void;
    initialValue: string;
}) => {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        setInputValue(initialValue);
    }, []);

    useEffect(() => {
        return () => {
            if (!inputValue) {
                return;
            }
            onBlur(inputValue);
        };
    }, [inputValue]);
    return (
        <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={(e) => onBlur(inputValue)}
            size="sm"
            variant="underlined"
            color="primary"
            onKeyDown={(e) => {
                if (e.key.toLowerCase() === "enter") {
                    onBlur(inputValue);
                }
            }}
        />
    );
};

export const PopoverFields: FC<TProps> = ({


                                              openPopover,
                                              onOpen,
                                              onClose,

                                              id,
                                              field,
                                              onChangeFieldValue,
                                              onAddFieldOption,
                                              deleteOption,
                                          }) => {
    const [isOpen, setIsOpen] = useState(openPopover[id]);
    console.log({id, openPopover, isExist: Boolean(openPopover[id])})
    return (
        <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
            <Popover
                placement="bottom"
                contentEditable="false"
                size="sm"
                data-index={id}
                key={id}
                isOpen={isOpen}
                onOpenChange={(open) => {
                    console.log('open', open)
                    if (open) {
                        onOpen(id)
                    } else {
                        onClose(id)
                    }
                    return setIsOpen(open)
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                opacity: {
                                    duration: 0,
                                },
                            },
                        },
                        exit: {
                            y: "10%",
                            opacity: 0,
                            transition: {
                                opacity: {
                                    duration: 0,
                                },
                            },
                        },
                    },
                }}
            >
                <PopoverTrigger>
                    <Button
                        variant="light"
                        color="default"
                        endContent={
                            <Image
                                src={ChevronIconDown}
                                alt="down"
                                className="relative top-1"
                            />
                        }
                    >
                        <span className="text-[#3F28C6]">______</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="px-1 py-2">
                        <div className="text-small font-bold">Варианты для пропуска:</div>
                        {field?.options?.map((option, optionIndex) => {
                            return (
                                <div
                                    className="flex items-center gap-1"
                                    key={optionIndex.toString() + option.isCorrect}
                                >
                                    <PopoverInput
                                        initialValue={option.value}
                                        onBlur={(val) => {
                                            onChangeFieldValue(id, optionIndex, val);
                                        }}
                                    />
                                    {field.options.length > 1 && (
                                        <Button
                                            onClick={() => {
                                                onClose(id);
                                                setIsOpen(false)

                                                deleteOption(id, optionIndex);
                                                setTimeout(() => {
                                                    const element = document.getElementById("popover-wrapper-" + id)?.firstChild as HTMLElement | null;
                                                    element?.click();
                                                }, 100);
                                            }}
                                            isIconOnly
                                            variant="light"
                                            className="hover:!bg-transparent"
                                            size="sm"
                                        >
                                            <Image src={Close} alt="delete option"/>
                                        </Button>
                                    )}

                                </div>
                            );
                        })}
                        <Button
                            className="p-2.5 bg-white cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                onClose(id);
                                setIsOpen(false)

                                onAddFieldOption(id);
                                setTimeout(() => {
                                    const element = document.getElementById("popover-wrapper-" + id)?.firstChild as HTMLElement | null;
                                    element?.click();
                                }, 50);
                            }}
                        >
                            <p className="text-[#3F28C6]">+ добавить вариант</p>
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
