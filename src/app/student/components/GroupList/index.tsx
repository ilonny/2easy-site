import { ProfileEmptyLessons } from "@/app/lessons/components/ProfileEmptyLessons";
import { useCallback, useEffect, useState } from "react";
import { CreateGroupModalForm } from "../CreateGroupModalForm";
import { useGroupList } from "../../hooks/useGroupList";
import { Button, Card } from "@nextui-org/react";

export const GroupList = () => {
  const [createIsVisible, setCreateIsVisible] = useState(false);
  const { groups, getGroups } = useGroupList();

  useEffect(() => {
    getGroups();
  }, [createIsVisible, getGroups]);

  const onPressCreateGroup = useCallback(() => {
    setCreateIsVisible(true);
  }, []);

  const onSuccessCreate = useCallback(() => {
    setCreateIsVisible(false);
  }, []);

  return (
    <>
      {!groups.length && (
        <ProfileEmptyLessons
          title="У вас пока нет групп"
          buttonTitle="Создать группу"
          onButtonPress={onPressCreateGroup}
        />
      )}
      <div className="w-[600px] gap-5 flex flex-wrap flex-col">
        {!!groups.length &&
          groups?.map((group) => {
            return (
              <Card key={group.id} radius="md" className="p-2">
                <div className="flex justify-between items-center">
                  <p className="font-bold">{group.name}</p>
                  <Button color="secondary">Изменить</Button>
                </div>
                {!!group.tag && <p>{group.tag}</p>}
              </Card>
            );
          })}
      </div>
      <div className="h-10" />
      <Button color="primary" className="px-10" onClick={onPressCreateGroup}>
        Создать группу
      </Button>
      <CreateGroupModalForm
        isVisible={createIsVisible}
        onSuccess={onSuccessCreate}
        setIsVisible={setCreateIsVisible}
      />
    </>
  );
};
