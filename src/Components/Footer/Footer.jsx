import React from "react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className="bg-green-600 text-white py-8 mt-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/donate" className="hover:underline">Donate Food</a></li>
            <li><a href="/ngo" className="hover:underline">Find Meals</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-sm">Email: support@shareameal.org</p>
          <p className="text-sm">Nairobi, Kenya</p>
        </div>

      </div>
      <div className="border-t border-green-400 mt-8 pt-4 text-center text-sm opacity-90">
        © {new Date().getFullYear()} Share a Meal. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;