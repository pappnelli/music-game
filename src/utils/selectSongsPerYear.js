export function selectSongsPerYear(songs, songsPerYear) {
  if (!songsPerYear) return songs;

  // 1) Csoportosítás év szerint
  const songsByYear = {};
  for (const song of songs) {
    const year = song.year;
    (songsByYear[year] ??= []).push(song);
  }

  // 2) Random indexek generálása
  function randomIndexes(limit, max) {
    const result = new Set();
    const count = Math.min(limit, max);

    while (result.size < count) {
      result.add(((Math.random() * max) | 0) + 1);
    }
    return result;
  }

  const selectedIndexesByYear = {};
  for (const [year, list] of Object.entries(songsByYear)) {
    selectedIndexesByYear[year] = randomIndexes(songsPerYear, list.length);
  }

  // 3) Dalok kiválasztása ID alapján
  const finalSongs = [];
  for (const song of songs) {
    const year = song.year;
    const suffix = Number(song.id.slice(5));
    if (selectedIndexesByYear[year]?.has(suffix)) {
      finalSongs.push(song);
    }
  }

  return finalSongs;
}
