import React from 'react';
import styles from './Sponsor.module.css';
import Sidebar from "../../Components/SideBar/SideBar";
import Header from '../../Components/Header/Header';
import ListingCard from '../../Components/ListingCard/ListingCard'; // Reusable card component
import { MdLocationOn, MdSearch, MdMap, MdStars } from 'react-icons/md';

export default function Sponsor(){
 
  return (
   <div className={styles.layout}>
      <Sidebar />

      <div className={styles.mainWrapper}>
        <Header avator="GEL" name="Green Energy Limited" role="Sponsor Account"  />
        
        <main className={styles.contentArea}>
          {/* Welcome Header */}
          <section className={styles.welcomeSection}>
             <h1 className={styles.greeting}>Hello, Welcome Back 👋</h1>
             <p className={styles.subtitle}>Make an Impact by sponsoring food for those in need</p>
          </section>
        </main>
      </div>
    </div>
  );
};

