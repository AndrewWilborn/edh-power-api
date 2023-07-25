import data from "./unique-artwork-20230720212130.json" assert { type: "json" };

for (let i = 0; i < data.length; i++) {
  const res = await fetch("http://localhost:3000/dev", {
    method: 'PATCH',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      id: data[i].id,
      artist: data[i].card_faces ?
        data[i].card_faces[0].artist
          ? data[i].card_faces[0].artist
          : data[i].artist
        : data[i].artist
    }),
  });
  const response = await res.json()
  console.log(response + "," + i)

}