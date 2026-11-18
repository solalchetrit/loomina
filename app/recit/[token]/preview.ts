/** Le récit d'exemple de /recit/apercu : la page sans base, pour la revue. */
export type DemoPreview = {
  status: string;
  first_name: string | null;
  title: string | null;
  content: string | null;
  created_at: string;
};

export const DEMO_PREVIEW: DemoPreview = {
  status: "written",
  first_name: "Suzanne",
  title: "Chez Marguerite, près de la fenêtre",
  content:
    "J’ai grandi à Saint-Flour, dans une maison simple près de la place d’Armes. Ma mère tenait un petit café-épicerie qui s’appelait « Chez Marguerite ». Dès l’entrée, il y avait cette odeur de café grillé mêlée à celle de la sciure.\n\nMon père était facteur rural. Il faisait sa tournée à vélo, toujours dehors, avec ce métier de route et de campagne. Au café-épicerie, il y avait aussi les hommes qui venaient au comptoir, surtout les jours de foire.\n\nCes jours-là, c’était un monde à part. Les vaches arrivaient par la grand-rue dès cinq heures du matin, et ma mère me réveillait pour l’aider à servir les premiers cafés.",
  created_at: new Date().toISOString(),
};
