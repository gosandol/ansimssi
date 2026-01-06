import React, { useState } from 'react';
import ServiceLayout from '../layouts/ServiceLayout';
import styles from './SpacesView.module.css';
import {
    Tv,
    Thermometer,
    Wind,
    Sun,
    Lightbulb,
    Refrigerator,
    Disc, // For Dishwasher
    Utensils, // For Oven?
    Flame, // For Induction
    Waves, // For Washer
    Shirt, // For Dryer
    Fan,
    Droplets
} from 'lucide-react';

const DeviceCard = ({ name, icon: Icon, isOn, onToggle }) => (
    <div
        className={`${styles.deviceCard} ${isOn ? styles.active : ''}`}
        onClick={onToggle}
    >
        <div className={styles.iconWrapper}>
            <Icon size={24} />
        </div>
        <div className={styles.deviceInfo}>
            <span className={styles.deviceName}>{name}</span>
            <span className={styles.deviceStatus}>{isOn ? '켜짐' : '꺼짐'}</span>
        </div>
    </div>
);

const SpacesView = ({ onBack, chatContent }) => {
    // Internal Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Initial State for Devices
    const [devices, setDevices] = useState({
        living_tv: false,
        living_aircon: false,
        living_purifier: true,
        living_curtain: false, // Open/Close logic simplified to On/Off for mock
        living_light: true,
        kitchen_fridge: true,
        kitchen_dishwasher: false,
        kitchen_oven: false,
        kitchen_induction: false,
        master_light: false,
        master_aircon: false,
        master_curtain: false,
        small_light: false,
        small_aircon: false,
        study_light: true,
        study_pc: true,
        laundry_washer: false,
        laundry_dryer: false,
        outdoor_vent: true,
        bath_vent: false,
        bath_heater: false
    });

    const toggleDevice = (id) => {
        setDevices(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <ServiceLayout
            title="우리집 IoT 제어"
            onBack={onBack}
            onChatToggle={() => setIsChatOpen(!isChatOpen)}
            isChatOpen={isChatOpen}
            chatContent={chatContent}
        >
            <div className={styles.container}>
                {/* Living Room */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>거실</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="TV" icon={Tv} isOn={devices.living_tv} onToggle={() => toggleDevice('living_tv')} />
                        <DeviceCard name="에어컨" icon={Thermometer} isOn={devices.living_aircon} onToggle={() => toggleDevice('living_aircon')} />
                        <DeviceCard name="공기청정기" icon={Wind} isOn={devices.living_purifier} onToggle={() => toggleDevice('living_purifier')} />
                        <DeviceCard name="커튼" icon={Sun} isOn={devices.living_curtain} onToggle={() => toggleDevice('living_curtain')} />
                        <DeviceCard name="조명" icon={Lightbulb} isOn={devices.living_light} onToggle={() => toggleDevice('living_light')} />
                    </div>
                </section>

                {/* Kitchen */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>주방</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="냉장고" icon={Refrigerator} isOn={devices.kitchen_fridge} onToggle={() => toggleDevice('kitchen_fridge')} />
                        <DeviceCard name="식기세척기" icon={Disc} isOn={devices.kitchen_dishwasher} onToggle={() => toggleDevice('kitchen_dishwasher')} />
                        <DeviceCard name="오븐" icon={Utensils} isOn={devices.kitchen_oven} onToggle={() => toggleDevice('kitchen_oven')} />
                        <DeviceCard name="인덕션" icon={Flame} isOn={devices.kitchen_induction} onToggle={() => toggleDevice('kitchen_induction')} />
                    </div>
                </section>

                {/* Master Room */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>안방</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="조명" icon={Lightbulb} isOn={devices.master_light} onToggle={() => toggleDevice('master_light')} />
                        <DeviceCard name="에어컨" icon={Thermometer} isOn={devices.master_aircon} onToggle={() => toggleDevice('master_aircon')} />
                        <DeviceCard name="커튼" icon={Sun} isOn={devices.master_curtain} onToggle={() => toggleDevice('master_curtain')} />
                    </div>
                </section>

                {/* Small Room */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>작은방</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="조명" icon={Lightbulb} isOn={devices.small_light} onToggle={() => toggleDevice('small_light')} />
                        <DeviceCard name="에어컨" icon={Thermometer} isOn={devices.small_aircon} onToggle={() => toggleDevice('small_aircon')} />
                    </div>
                </section>

                {/* Study */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>공부방</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="조명" icon={Lightbulb} isOn={devices.study_light} onToggle={() => toggleDevice('study_light')} />
                        <DeviceCard name="PC 전원" icon={Tv} isOn={devices.study_pc} onToggle={() => toggleDevice('study_pc')} />
                    </div>
                </section>

                {/* Laundry */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>세탁실</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="세탁기" icon={Waves} isOn={devices.laundry_washer} onToggle={() => toggleDevice('laundry_washer')} />
                        <DeviceCard name="건조기" icon={Shirt} isOn={devices.laundry_dryer} onToggle={() => toggleDevice('laundry_dryer')} />
                    </div>
                </section>

                {/* Outdoor & Bath */}
                <section className={styles.roomSection}>
                    <h2 className={styles.roomTitle}>기타 공간</h2>
                    <div className={styles.deviceGrid}>
                        <DeviceCard name="실외기실 환기" icon={Fan} isOn={devices.outdoor_vent} onToggle={() => toggleDevice('outdoor_vent')} />
                        <DeviceCard name="화장실 환풍기" icon={Fan} isOn={devices.bath_vent} onToggle={() => toggleDevice('bath_vent')} />
                        <DeviceCard name="화장실 온풍기" icon={Droplets} isOn={devices.bath_heater} onToggle={() => toggleDevice('bath_heater')} />
                    </div>
                </section>

                {/* Space at bottom */}
                <div style={{ height: '40px' }} />
            </div>
        </ServiceLayout>
    );
};

export default SpacesView;
