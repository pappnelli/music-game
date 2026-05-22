import { GripVertical, Pencil, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ColorDisplay from "../../ui/ColorDisplay";
import IconButton from "../../ui/IconButton";
import { useModal } from "../../contexts/useModal";
import { moveTeam, removeTeam } from "../../pages/Setup/setupSlice";
import EditTeamModal from "./EditTeamModal";

export default function TeamList({ inputRef }) {
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const teams = useSelector((state) => state.setup.teams ?? []);

  const handleEditTeam = (id) => {
    openModal(<EditTeamModal teamId={id} />);
  };

  const handleRemoveTeam = (id) => {
    dispatch(removeTeam(id));
    inputRef?.current?.focus();
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.index === destination.index) return;

    const fromId = teams[source.index].id;
    const toId = teams[destination.index].id;

    dispatch(moveTeam({ fromId, toId }));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="teams-droppable">
        {(provided) => (
          <div className="teams" ref={provided.innerRef} {...provided.droppableProps}>
            {teams.map((team, index) => (
              <Draggable key={team.id} draggableId={`team-${team.id}`} index={index}>
                {(provided, snapshot) => (
                  <div className={`team-div ${snapshot.isDragging ? "dragging" : ""}`} ref={provided.innerRef} {...provided.draggableProps}>
                    <div className="team">
                      <ColorDisplay color={team.color} justDisplay={true} />

                      <span className="team-name">{team.name}</span>

                      <IconButton className="ghost" onClick={() => handleEditTeam(team.id)} title="Edit team">
                        <Pencil size={16} />
                      </IconButton>

                      <IconButton className="ghost" onClick={() => handleRemoveTeam(team.id)} title="Delete team">
                        <Trash size={16} />
                      </IconButton>

                      <div className="drag-handle" {...provided.dragHandleProps}>
                        <GripVertical size={16} />
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
