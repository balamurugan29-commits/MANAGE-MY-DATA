-- Create B2B Directory Database Schema for Microsoft SQL Server (MSSQL)

-- Create users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] VARCHAR(50) UNIQUE NOT NULL,
        [password] VARCHAR(255) NOT NULL,
        [email] VARCHAR(100) UNIQUE NOT NULL,
        [role] VARCHAR(20) DEFAULT 'ROLE_BUSINESS' NOT NULL, -- ROLE_BUSINESS, ROLE_ADMIN, ROLE_BUYER
        [created_at] DATETIME DEFAULT GETDATE() NOT NULL
    );
END

-- Create categories table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[categories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[categories] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] VARCHAR(100) NOT NULL,
        [icon_class] VARCHAR(50) NULL,
        [slug] VARCHAR(100) UNIQUE NOT NULL,
        [description] NVARCHAR(MAX) NULL
    );
END

-- Create cities table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cities]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cities] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] VARCHAR(100) NOT NULL,
        [state] VARCHAR(100) NOT NULL
    );
END

-- Create businesses table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[businesses]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[businesses] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NULL,
        [name] VARCHAR(150) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [category_id] INT NULL,
        [city_id] INT NULL,
        [address] VARCHAR(255) NULL,
        [contact_phone] VARCHAR(20) NULL,
        [contact_email] VARCHAR(100) NULL,
        [website] VARCHAR(150) NULL,
        [logo_url] VARCHAR(255) NULL,
        [is_verified] BIT DEFAULT 0 NOT NULL,
        [is_approved] BIT DEFAULT 0 NOT NULL, -- Require admin approval
        [rating] DECIMAL(2,1) DEFAULT 0.0 NOT NULL,
        [created_at] DATETIME DEFAULT GETDATE() NOT NULL,
        CONSTRAINT FK_Business_User FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT FK_Business_Category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        CONSTRAINT FK_Business_City FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
    );
END

-- Create products table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[products] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [business_id] INT NOT NULL,
        [name] VARCHAR(150) NOT NULL,
        [description] NVARCHAR(MAX) NULL,
        [price] DECIMAL(10,2) NULL,
        [image_url] VARCHAR(255) NULL,
        [created_at] DATETIME DEFAULT GETDATE() NOT NULL,
        CONSTRAINT FK_Product_Business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );
END

-- Create inquiries table (buyer leads)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[inquiries]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[inquiries] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [business_id] INT NOT NULL,
        [sender_name] VARCHAR(100) NOT NULL,
        [sender_email] VARCHAR(100) NOT NULL,
        [sender_phone] VARCHAR(20) NULL,
        [message] NVARCHAR(MAX) NOT NULL,
        [status] VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, RESPONDED
        [created_at] DATETIME DEFAULT GETDATE() NOT NULL,
        CONSTRAINT FK_Inquiry_Business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );
END

-- Create reviews table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[reviews]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[reviews] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [business_id] INT NOT NULL,
        [user_name] VARCHAR(100) NOT NULL,
        [rating] INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        [comment] NVARCHAR(MAX) NULL,
        [is_approved] BIT DEFAULT 1 NOT NULL, -- Moderate reviews if needed
        [created_at] DATETIME DEFAULT GETDATE() NOT NULL,
        CONSTRAINT FK_Review_Business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );
END

-- =======================================================
-- Seed Data
-- =======================================================

-- Categories Seed Data
SET IDENTITY_INSERT [dbo].[categories] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[categories] WHERE [id] = 1)
    INSERT INTO [dbo].[categories] ([id], [name], [icon_class], [slug], [description]) VALUES
    (1, 'Business Services', 'business-services', 'business-services', 'B2B services, consulting, HR, accounting, and marketing.'),
    (2, 'Real Estate & Construction', 'construction-real-estate', 'construction-real-estate', 'Building materials, builders, contractors, and real estate services.'),
    (3, 'Engineering Service', 'engineering-service', 'engineering-service', 'Industrial engineering, fabrication, design, and machinery solutions.'),
    (4, 'Tours, Travels & Hotels', 'tours-travels-hotels', 'tours-travels-hotels', 'Tour packages, hotels, agents, logistics, and hospitality.'),
    (5, 'Computers & Internet', 'computer-software', 'computer-software', 'Software development, IT hardware, networking, and digital solutions.'),
    (6, 'Financial & Legal Services', 'financial-legal-services', 'financial-legal-services', 'Banking, loans, legal advisors, patents, and corporate legal services.'),
    (7, 'Transportation & Logistics', 'transportation-logistics-services', 'transportation-logistics-services', 'Shipping, trucking, warehouse services, packers and movers.'),
    (8, 'Education & Training', 'education-training-services', 'education-training-services', 'Industrial training, schools, universities, professional courses.'),
    (9, 'Pharmaceutical & Healthcare', 'pharmaceutical-drugs-medicines', 'pharmaceutical-drugs-medicines', 'Medicines, medical equipment, hospital services, and pharma distribution.'),
    (10, 'Electronics & Electrical', 'electronics-electrical', 'electronics-electrical', 'Electronic components, wiring, power distribution, and instruments.'),
    (11, 'Industrial Machinery', 'machines', 'machines', 'Heavy machinery, factory equipment, components, and tools.'),
    (12, 'Apparel & Fashion Accessories', 'apparel-fashion', 'apparel-fashion', 'Garments, fabrics, textiles, shoes, and luxury items.');
SET IDENTITY_INSERT [dbo].[categories] OFF;

-- Cities Seed Data
SET IDENTITY_INSERT [dbo].[cities] ON;
IF NOT EXISTS (SELECT 1 FROM [dbo].[cities] WHERE [id] = 1)
    INSERT INTO [dbo].[cities] ([id], [name], [state]) VALUES
    (1, 'Delhi', 'Delhi'),
    (2, 'Mumbai', 'Maharashtra'),
    (3, 'Bengaluru', 'Karnataka'),
    (4, 'Chennai', 'Tamil Nadu'),
    (5, 'Surat', 'Gujarat'),
    (6, 'Ahmedabad', 'Gujarat'),
    (7, 'Pune', 'Maharashtra'),
    (8, 'Hyderabad', 'Telangana'),
    (9, 'Kolkata', 'West Bengal'),
    (10, 'Jaipur', 'Rajasthan'),
    (11, 'Coimbatore', 'Tamil Nadu'),
    (12, 'Noida', 'Uttar Pradesh'),
    (13, 'Gurugram', 'Haryana'),
    (14, 'Vadodara', 'Gujarat'),
    (15, 'Ludhiana', 'Punjab');
SET IDENTITY_INSERT [dbo].[cities] OFF;
