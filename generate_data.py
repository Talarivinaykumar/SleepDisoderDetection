import csv
import random

headers = ['Person ID','Gender','Age','Occupation','Sleep Duration','Quality of Sleep','Physical Activity Level','Stress Level','BMI Category','Blood Pressure','Heart Rate','Daily Steps','Sleep Disorder']

occupations = ['Software Engineer', 'Doctor', 'Teacher', 'Nurse', 'Engineer', 'Accountant', 'Lawyer', 'Scientist']
bmi_categories = ['Normal', 'Normal Weight', 'Overweight', 'Obese']
genders = ['Male', 'Female']

def generate_row(person_id, disorder):
    gender = random.choice(genders)
    age = random.randint(22, 65)
    occupation = random.choice(occupations)
    quality = random.randint(1, 10)
    activity = random.randint(20, 90)
    bmi = random.choice(bmi_categories)
    
    if disorder == 'Severe Sleep Deprivation':
        sleep = round(random.uniform(0.5, 3.0), 1)
        stress = random.randint(8, 10)
        hr = random.randint(90, 115)
        sys_bp = random.randint(130, 150)
        dia_bp = random.randint(85, 95)
        steps = random.randint(1000, 3000)
    elif disorder == 'Insomnia':
        sleep = round(random.uniform(3.1, 5.5), 1)
        stress = random.randint(7, 10)
        hr = random.randint(75, 95)
        sys_bp = random.randint(125, 140)
        dia_bp = random.randint(80, 90)
        steps = random.randint(2000, 4500)
    elif disorder == 'Sleep Apnea':
        sleep = round(random.uniform(4.0, 6.5), 1)
        stress = random.randint(6, 9)
        hr = random.randint(85, 110)
        sys_bp = random.randint(135, 155)
        dia_bp = random.randint(85, 95)
        steps = random.randint(3000, 5000)
    elif disorder == 'Restless Legs Syndrome':
        sleep = round(random.uniform(3.5, 6.0), 1)
        stress = random.randint(5, 8)
        hr = random.randint(65, 85)
        sys_bp = random.randint(115, 130)
        dia_bp = random.randint(75, 85)
        steps = random.randint(3000, 6000)
    elif disorder == 'Circadian Rhythm Disorder':
        sleep = round(random.uniform(5.0, 9.0), 1)
        stress = random.randint(4, 7)
        hr = random.randint(60, 85)
        sys_bp = random.randint(110, 125)
        dia_bp = random.randint(70, 80)
        steps = random.randint(4000, 7000)
    elif disorder == 'Hypersomnia':
        sleep = round(random.uniform(9.5, 12.0), 1)
        stress = random.randint(2, 6)
        hr = random.randint(55, 75)
        sys_bp = random.randint(110, 125)
        dia_bp = random.randint(70, 80)
        steps = random.randint(1000, 4000)
    else: # No Sleep Disorder
        sleep = round(random.uniform(7.0, 9.0), 1)
        stress = random.randint(1, 4)
        hr = random.randint(55, 70)
        sys_bp = random.randint(110, 120)
        dia_bp = random.randint(70, 80)
        steps = random.randint(6000, 12000)
        
    bp = f"{sys_bp}/{dia_bp}"
    return [person_id, gender, age, occupation, sleep, quality, activity, stress, bmi, bp, hr, steps, disorder]

disorders = ['Severe Sleep Deprivation', 'Insomnia', 'Sleep Apnea', 'Restless Legs Syndrome', 'Circadian Rhythm Disorder', 'Hypersomnia', 'No Sleep Disorder']

# Try to keep the same format
with open('sleep_data_v2.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    for i in range(1, 1001):
        d = disorders[i % len(disorders)]
        writer.writerow(generate_row(i, d))

print("Done")
