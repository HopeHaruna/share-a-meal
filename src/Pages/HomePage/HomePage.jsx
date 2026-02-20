 import '../../Theme/Global.css'
import styles from "./HomePage.module.css";
import heroImg from "../../assets/Images/food.png"; 
import Navbar from "../../Components/Navbar/Navbar"
import ProcuderCard from "../../Components/ProcuderCard/ProcuderCard"
import ImpactCard from "../../Components/ImpactCard/ImpactCard"

import RestrauntIcon from "../../assets/Icons/restaurant.svg?react"
import SponsorIcon from "../../assets/Icons/money-dollar.svg?react"
import PeopleIcon from "../../assets/Icons/people.svg?react"
import CompassionIcon from "../../assets/Icons/Compassion.svg?react";
import CommunityIcon from "../../assets/Icons/community.svg?react";
import SustainabilityIcon from "../../assets/Icons/sustainability.svg?react"
import TransparencyIcon from "../../assets/Icons/Transparency.svg?react"

export default function Home() {
  return (
    <main className={styles.container}>
      <Navbar/>
      
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Rescuing <span className={styles.shade}>Food</span>Waste Through Community <span className={styles.shade}>Action</span></h1>
          <p>Connecting SMEs, Sponsors & People in Need.</p>
          <div className={styles.heroCTA}>
            <p>One meal at a time</p>
            <button className={styles.primaryBtn}>Get Started</button>
          </div>
          
        </div>

        <div className={styles.heroImage}>
          <img src={heroImg} className={styles.image} alt="Food Bowl" />
          <div className={styles.orange__ball}></div>
        </div>
      </section>

      
      <section className={styles.section}>
        <h2>How It Works</h2>

        <div className={styles.cards}>
           <ProcuderCard
                title="SMEs"
                icon={<RestrauntIcon />}
                description="Donate surplus food instead of throwing it"
                />
           <ProcuderCard
                title="Sponsors"
                icon={<SponsorIcon/>}
                description="Fund meals for vulnerable individuals"
                />
                 <ProcuderCard
                title="Beneficiaries"
                icon={<PeopleIcon/>}
                description="Request and receive meals with Dignity"
                />
        </div>
      </section>

      <section className={styles.impact}>
        <h2>Impact</h2>

        <div className={styles.stats}>
          <ImpactCard
          title="12K"
          description="Meals Shared"
          />
           <ImpactCard
           title="12K"
          description="SMEs Joined"
           
           />
            <ImpactCard 
            title="12K"
          description="Sponers"
            
            />
            <ImpactCard 
            title="12K"
          description="Communities Served"
            
            />
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.section}>
        <h2>About Us</h2>
        <h3>Reducing <span className={styles.shade}>Food</span>Waste Through Community <span className={styles.shade}>Action</span>
</h3>
        <p className={styles.description}>
          We are on a mission to reduce food waste and fight hunger by
          connecting surplus food with those in need.
        </p>

        <div className={styles.ourProfile}>
          <section className={styles.values}>
            <div>
              <CompassionIcon/>
              <p>Compassion</p>
            </div>
            <div>
              <CommunityIcon/>
              <p>Community</p>
            </div>
            <div>
              <TransparencyIcon/>
              <p>Transparency</p>
            </div>
            <div>
              <SustainabilityIcon/>
              <p>Sustainabilty</p>
            </div>
          </section>
          <section className={styles.grid}>
             <div className={styles.box}>
            <h3>Mission</h3>
            <p>Reduce food waste through technology and community action.</p>
          </div>

          <div className={styles.box}>
            <h3>Vision</h3>
            <p>A world where no food is wasted and no one goes hungry.</p>
          </div>

          </section>
        </div>
      </section>

    </main>
  );
}
