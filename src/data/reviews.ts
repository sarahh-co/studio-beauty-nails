export type Review = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export const reviews: Review[] = [
  {
    name: "Iliana B.",
    rating: 5,
    text: "Très accueillante et chaleureuse, elle sait parfaitement mettre les clientes à l’aise tout en restant professionnelle et à l’écoute de nos besoins.",
  },
  {
    name: "Lilou B.",
    rating: 5,
    text: "fait un travail exceptionnel et très accueillant très aimable je recommande à 100% ces la meilleur",
  },
  {
    name: "San D.",
    rating: 5,
    text: "Eva est très agréable et professionnelle. Je vous la recommande.\nOn passe un bon moment dans sa jolie cabine.",
  },
];
