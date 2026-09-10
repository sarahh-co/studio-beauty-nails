export type FaqItem = {
  question: string;
  answer: string;
};

export const faq: FaqItem[] = [
  {
    question: "Comment réserver ?",
    answer:
      "Choisissez votre prestation et vos options, puis un créneau. Vous recevez une confirmation par e-mail et un rappel la veille de votre rendez-vous.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Le paiement se fait uniquement en espèces.",
  },
  {
    question: "Puis-je réserver en dehors des horaires ?",
    answer:
      "Oui, sur demande. Je confirme le créneau personnellement, et un supplément s’applique (voir les tarifs).",
  },
  {
    question: "Combien coûte un nail art ?",
    answer:
      "Le nail art est sur devis. Faites votre demande lors de la réservation et je vous réponds avec un prix.",
  },
  {
    question: "C’est quoi la beauté des mains?",
    answer:
      "La beauté des mains consiste tout simplement a un soin complet pour les mains. En général, ça comprend :\nUn limage des ongles -on leur donne une jolie forme.\nUn soin des cuticules - on les repousse et on nettoie le contour.\nUn gommage des mains - pour enlever les peaux mortes et adoucir.\nMassage hydratant - crème ou huile pour nourrir la peau.\nPose de vernis classique (optionnel)",
  },
  {
    question: "C’est quoi un gainage (gel + semi-permanent) sur ongle naturel?",
    answer:
      "La pose combinée gel + semi-permanent est une technique qui permet d’avoir des ongles solides, protégés et colorés avec une tenue longue durée. Le gel ou la rubber base renforce et durcit l’ongle naturel, tandis que le semi-permanent apporte couleur, brillance et finition impeccable.",
  },
  {
    question:
      "C’est quoi la pose complète? (capsule + gel + (optionnel) semi-permanent+ nail art....)",
    answer:
      "Une pose complète en onglerie, c’est une prestation où on crée entièrement un ongle artificiel, souvent pour rallonger ou transformer complètement les ongles naturels",
  },
  {
    question: "C’est quoi un remplissage?",
    answer:
      "Concrètement, quand tes ongles poussent ,il y a un espace qui apparaît à la base (près de la cuticule).\nLe remplissage sert à :\n* Combler cet espace\n* Remettre de la matière (gel)\n* Redonner une belle forme à l’ongle\n* Changer la couleur ou le disign\nEn général il se fait toutes les 3 à 4 semaines.",
  },
  {
    question: "Que se passe-t-il si je suis en retard ou si je dois annuler ?",
    answer:
      "Tout retard de plus de 15min sera automatiquement annulé pour ne pas perturber les créneaux suivants!\nMerci de me prevenir la veille si il y a une annulation de RDV.",
  },
  {
    question: "Où se trouve le salon ?",
    answer:
      "141 Pl. Jean Monnet, 01630 Saint-Genis-Pouilly, derrière l’entrée de l’institut Lyne.",
  },
];
