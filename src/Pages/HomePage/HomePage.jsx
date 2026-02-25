 import '../../Theme/Global.css'
import styles from "./HomePage.module.css";
import heroImg from "../../assets/Images/food.png"; 
import Navbar from "../../Components/Navbar/Navbar"
import ProcuderCard from "../../Components/ProcuderCard/ProcuderCard"
import ImpactCard from "../../Components/ImpactCard/ImpactCard"
import Button from "../../Components/Button/Button"
import Footer from "../../Components/Footer/Footer"

import SMEsIcon from "../../assets/Icons/restaurant.svg?react"
import SponsorIcon from "../../assets/Icons/money-dollar.svg?react"
import PeopleIcon from "../../assets/Icons/people.svg?react"
import CompassionIcon from "../../assets/Icons/Compassion.svg?react";
import CommunityIcon from "../../assets/Icons/community.svg?react";
import SustainabilityIcon from "../../assets/Icons/sustainability.svg?react"
import TransparencyIcon from "../../assets/Icons/Transparency.svg?react"
import MealIcon from "../../assets/Icons/Meal.svg?react"


export default function Home() {
  return (
    <main className={styles.container}>
      
      
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Rescuing <span className={styles.shade}>Food</span> Waste Through Community <span className={styles.shade}>Action</span></h1>
          <p>Connecting SMEs, Sponsors & People in Need.</p>
          <div className={styles.heroCTA}>
            <p>One meal at a time</p>
           <Button/>
          </div>
          
        </div>

        <div className={styles.heroImage}>
          <img src={heroImg} className={styles.image} alt="Food Bowl" />
          <div className={styles.orange__ball}></div>
          <div className={styles.leftOrange__ball}></div>
          <div className={styles.rightOrange__ball}></div>
        </div>
      </section>

      
      <section className={styles.section} id="how-it-works-ln">
        <h2 className={styles.subtitles}>How It Works</h2>

        <div className={styles.cards}>
           <ProcuderCard
                title="SMEs"
                icon={<SMEsIcon/>}
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

      <section className={styles.impact} id="impact">
        <h2 className={styles.subtitles}>Impact</h2>

        <div className={styles.stats}>
          <ImpactCard
          icon={<MealIcon/>}
          title="12K"
          description="Meals Shared"
          />
           <ImpactCard
           icon={<SMEsIcon/>}
           title="12K"
          description="SMEs Joined"
           
           />
            <ImpactCard 
             icon={<SMEsIcon/>}
            title="12K"
          description="Sponers"
            
            />
            <ImpactCard 
            icon={<CommunityIcon/>}
            
            title="12K"
          description="Communities Served"
            
            />
        </div>
      </section>

      <section className={styles.section} id="about-us">
        <h2 className={styles.subtitles}> About Us</h2>
        <h3>Reducing <span className={styles.shade}>Food</span> Waste Through Community <span className={styles.shade}>Action</span>
</h3>
        <p className={styles.description}>
          We are on a mission to reduce food waste and fight hunger by
          connecting surplus food with those in need.
        </p>

        <div className={styles.ourProfile}>
          <section className={styles.values}>
            <div className={styles.item}>
              <CompassionIcon className={styles.valuesIcons}/>
              <span className={styles.decor}>Compassion</span>
            </div>
            <div className={styles.item}>
              <CommunityIcon/>
              <span className={styles.decor}>Community</span>
            </div>
            <div className={styles.item}>
              <TransparencyIcon/>
              <span className={styles.decor}>Transparency</span>
            </div>
            <div className={styles.item}>
              <SustainabilityIcon/>
              <span className={styles.decor}>Sustainabilty</span>
            </div>
          </section>
          <section className={styles.grid}>
            <div className={styles.vision}>
            <h3>Vision</h3>
            <p>A world where no food is wasted and no one goes hungry.</p>
          </div>
             <div className={styles.mission}>
            <h3>Mission</h3>
            <p>To reduce food waste and fight hunger by creating a trusted digital platform that 
              connects restaurants, sponsors, and communities,  ensuring surplus food reaches those who need it most.</p>
          </div>

          

          </section>
        </div>
      </section>
    </main>
  );
}
