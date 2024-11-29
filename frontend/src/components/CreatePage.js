import React from "react";
import { useTranslation } from "react-i18next";

const CreatePage = () => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>{t('create')}</h1>
    </div>
  );
};

export default CreatePage;