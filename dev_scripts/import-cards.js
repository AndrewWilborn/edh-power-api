import data from "./unique-artwork-20230720212130copy.json" assert { type: "json" };

function isValidCommander(card) {
  if (card.legalities.commander !== "legal") {
    return false;
  }
  if (card.card_faces) {
    if (card.card_faces[0].type_line.includes("Legendary") && card.card_faces[0].type_line.includes("Creature")) {
      return true
    }
    if (card.card_faces[0].oracle_text.includes("can be your commander")) {
      return true
    }
    // Single faced cards
  } else {
    if (card.type_line.includes("Legendary") && (card.type_line.includes("Creature") || card.type_line.includes("Background"))) {
      return true
    }
    if (card.oracle_text.includes("can be your commander")) {
      return true
    }
  }
  if (card.name === "Grist, the Hunger Tide") {
    return true
  }
  return false;
}

for (let i = 0; i < data.length; i++) {
  console.log(data[i].name)

  const res = await fetch("http://localhost:3000/cards", {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      id: data[i].id,
      name: data[i].name,
      image_uri: data[i].card_faces ?
        data[i].card_faces[0].image_uris
          ? data[i].card_faces[0].image_uris.art_crop
          : data[i].image_uris.art_crop
        : data[i].image_uris.art_crop,
      color_identity: data[i].color_identity.join(""),
      valid_commander: isValidCommander(data[i])
    }),
  });
  const response = await res.json()
  console.log(response)
}