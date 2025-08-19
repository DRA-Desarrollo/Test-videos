import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/">Volver a la página de inicio</Link>
    </div>
  );
};

export default NotFoundPage;
