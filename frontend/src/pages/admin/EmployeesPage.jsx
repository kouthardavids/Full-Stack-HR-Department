import React from 'react';
import Layout from '../../components/Layout'; // your layout with sidebar
import EmployeesListings from '../../components/EmployeesListings';

const EmployeesPage = () => {
  return (
    <Layout>
      <EmployeesListings />
    </Layout>
  );
};

export default EmployeesPage;

