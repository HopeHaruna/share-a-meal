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
        <div className={styles.topSection}>
        
        {/* Token Balance */}
        <div className={styles.tokenCard}>
          <h3>Token Balance</h3>
          <h1>1,250</h1>
          <p>~ 125 meals pending</p>
          <small>Tokens do not expire and can be used anytime</small>
          <button className={styles.buyBtn}>+ Buy Tokens</button>
        </div>

        {/* Sponsor Section */}
        <div className={styles.sponsorCard}>
          <h3>Sponsor a Meal Instantly</h3>

          <div className={styles.mealOptions}>
            <div>
              <h4>1 Meal</h4>
              <p>$10</p>
            </div>
            <div>
              <h4>5 Meals</h4>
              <p>$50</p>
            </div>
            <div>
              <h4>10 Meals</h4>
              <p>$100</p>
            </div>
            <div>
              <h4>Custom</h4>
              <p>Enter Amount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <h4>Active Campaigns</h4>
          <h2>12</h2>
        </div>
        <div className={styles.statCard}>
          <h4>Meals Funded</h4>
          <h2>248</h2>
        </div>
        <div className={styles.statCard}>
          <h4>Total Impact</h4>
          <h2>1,847</h2>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className={styles.aiSection}>
        <h3>★ AI Match Suggestions</h3>
        <p>Emergency Food Relief needs urgent support for 200 displaced families</p>
        <p>School Lunch Program is 27% funded - help reach 150 students</p>
        <p>Your tokens can make an immediate impact during peak meal distribution hours</p>
      </div>

      {/* Recommended Campaigns */}
      <div className={styles.recommendedSection}>
        <h3>Recommended Campaigns</h3>

        <div className={styles.campaignGrid}>
          <div className={styles.campaignCard}>
            <h4>Emergency Food Relief - Yaba</h4>
            <p>Support urgent distribution to 200 families affected by flooding</p>
            <button>Fund With Tokens</button>
          </div>

          <div className={styles.campaignCard}>
            <h4>School Lunch Program - Surulere</h4>
            <p>Fund daily lunch for 150 students at Community Primary School</p>
            <button>Fund With Tokens</button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        
        {/* Recent Impact */}
        <div className={styles.recentImpact}>
          <h3>Recent Impact</h3>
          <div className={styles.impactCard}>
            <h4>10 Meals</h4>
            <p>Hope Alive NGO, Yaba</p>
          </div>
          <div className={styles.impactCard}>
            <h4>5 Meals</h4>
            <p>Community Kitchen, Ikeja</p>
          </div>
        </div>

        {/* Monthly Impact */}
        <div className={styles.monthImpact}>
          <h3>Your Impact This Month</h3>
          <p><strong>Meals Sponsored:</strong> 38</p>
          <p><strong>People Helped:</strong> 187</p>
          <p><strong>Campaigns Supported:</strong> 8</p>
        </div>

      </div>

        </main>
      </div>
    </div>
  );
};

