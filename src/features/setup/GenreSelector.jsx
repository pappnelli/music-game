import CheckboxInput from "../../ui/CheckboxInput";

export default function GenreSelector({ genres, selected, onChange }) {
  const toggle = (genre) => {
    let updated;

    if (selected.length === 1 && selected[0] === genre) {
      updated = genres;
    } else {
      if (selected.includes(genre)) {
        updated = selected.filter((g) => g !== genre);
      } else {
        updated = [...selected, genre];
      }
    }

    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "1.5rem", minHeight: "40px" }}>
      {genres.map((genre) => (
        <CheckboxInput key={genre} elem={genre} checked={selected.includes(genre)} onChange={() => toggle(genre)} />
      ))}
    </div>
  );
}
