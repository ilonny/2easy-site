import { Button } from "@nextui-org/react";
import { useState } from "react";
import { GroupList } from "../GroupList";
import { StudentList } from "../StudentList";

export const ProfileStudents = () => {
  const [tabIndex, setTabIndex] = useState<"students" | "groups">("students");

  return (
    <>
      {/* <div className="flex gap-5">
        <Button
          radius="full"
          color="primary"
          variant={tabIndex === "students" ? "solid" : "faded"}
          onClick={() => setTabIndex("students")}
        >
          Ученики
        </Button>
        <Button
          radius="full"
          color="primary"
          variant={tabIndex === "groups" ? "solid" : "faded"}
          onClick={() => setTabIndex("groups")}
        >
          Группы
        </Button>
      </div>
      <div className="h-10" /> */}
      <StudentList />
      {/* {tabIndex === "students" && <StudentList />}
      {tabIndex === "groups" && <GroupList />} */}
    </>
  );
};
