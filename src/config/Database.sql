-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-202329-db.mysql-202329:19999
-- Generation Time: 25 أكتوبر 2025 الساعة 03:56
-- إصدار الخادم: 8.0.26
-- PHP Version: 7.2.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lexra`
--

-- --------------------------------------------------------

--
-- بنية الجدول `annual_leaves`
--

CREATE TABLE `annual_leaves` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `total_days` int NOT NULL,
  `remaining_days` int DEFAULT '0',
  `leave_type` enum('paid','unpaid') NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `annual_leaves`
--

INSERT INTO `annual_leaves` (`id`, `employee_id`, `date`, `from_date`, `to_date`, `total_days`, `remaining_days`, `leave_type`, `created_by`, `created_at`) VALUES
(1, 90, '2025-10-07', '2025-10-08', '2025-10-22', 15, 12, 'paid', 73, '2025-10-12 04:51:20'),
(2, 114, '2025-10-19', '2025-10-20', '2025-10-21', 2, 28, 'paid', 90, '2025-10-20 10:46:18');

-- --------------------------------------------------------

--
-- بنية الجدول `app_notifications`
--

CREATE TABLE `app_notifications` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error','system') DEFAULT 'info',
  `recipient_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `related_type` enum('task','client request','employee','event','none','memo') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'none',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `assets`
--

CREATE TABLE `assets` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `branch_id` int NOT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `record_type` varchar(40) NOT NULL DEFAULT 'resource',
  `created_by` int DEFAULT NULL,
  `note` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `assets`
--

INSERT INTO `assets` (`id`, `name`, `type`, `branch_id`, `issue_date`, `expiry_date`, `created_at`, `record_type`, `created_by`, `note`) VALUES
(3, 'dubai T 65433', 'ملكية مركبة', 2, '2025-10-01', '2025-10-29', '2025-10-13 04:36:58', 'resource', NULL, NULL),
(4, 'رخصة دبي', 'رخصة ', 2, '2025-10-02', '2026-01-15', '2025-10-13 07:38:14', 'office', 90, 'رخصة دبي 1376543'),
(7, 'رخصة عجمان', 'رخصة تجارية', 3, '2025-10-07', '2025-10-23', '2025-10-13 08:38:17', 'office', 90, NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `asset_documents`
--

CREATE TABLE `asset_documents` (
  `id` int NOT NULL,
  `asset_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int NOT NULL,
  `bank_name` varchar(150) NOT NULL,
  `account_name` varchar(150) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `iban` varchar(100) DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `current_balance` decimal(18,2) DEFAULT '0.00',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `bank_name`, `account_name`, `account_number`, `iban`, `branch_id`, `current_balance`, `status`, `created_by`, `created_at`) VALUES
(1, 'ADIB', 'بنك أبوظبي الإسلامي', '14727007', '14727007', 2, '16175.17', 'active', NULL, '2025-10-16 10:44:47'),
(2, 'ENBD', 'بنك الإمارات دبي الوطني', '1014889400501', '1014889400501', 3, '148890.78', 'active', NULL, '2025-10-16 10:46:30');

-- --------------------------------------------------------

--
-- بنية الجدول `branches`
--

CREATE TABLE `branches` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `branches`
--

INSERT INTO `branches` (`id`, `name_ar`, `name_en`, `location`, `created_at`) VALUES
(1, 'فرع ابوظبي', 'Abu Dhabi Branch', NULL, '2025-09-18 06:14:33'),
(2, 'فرع دبي', 'Dubai Branch', NULL, '2025-09-18 06:14:33'),
(3, 'فرع عجمان', 'Ajman Branch', 'عجمان - الجرف - شارع الشيخ زايد', '2025-09-18 06:14:33');

-- --------------------------------------------------------

--
-- بنية الجدول `call_logs`
--

CREATE TABLE `call_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `call_type` enum('outgoing','incoming') NOT NULL,
  `caller_name` varchar(150) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `call_date` date NOT NULL,
  `call_time` time NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `details` text,
  `duration_minutes` int DEFAULT '0',
  `file_case_number` varchar(100) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `call_logs`
--

INSERT INTO `call_logs` (`id`, `call_type`, `caller_name`, `phone_number`, `call_date`, `call_time`, `topic`, `details`, `duration_minutes`, `file_case_number`, `created_by`, `created_at`) VALUES
(2, 'outgoing', 'test', '0501455918', '2025-10-14', '15:06:00', 'test', 'test', 2, 'test', 90, '2025-10-17 11:03:03');

-- --------------------------------------------------------

--
-- بنية الجدول `cases`
--

CREATE TABLE `cases` (
  `id` int NOT NULL,
  `file_number` varchar(50) NOT NULL,
  `case_number` varchar(100) DEFAULT NULL,
  `police_station_id` int DEFAULT NULL,
  `public_prosecution_id` int DEFAULT NULL,
  `court_id` int DEFAULT NULL,
  `lawyer_id` int DEFAULT NULL,
  `secretary_id` int DEFAULT NULL,
  `case_classification_id` int DEFAULT NULL,
  `counter_case_id` int DEFAULT NULL,
  `case_type_id` int DEFAULT NULL,
  `legal_advisor_id` int DEFAULT NULL,
  `legal_researcher_id` int DEFAULT NULL,
  `fees` decimal(10,2) DEFAULT '0.00',
  `counterclaim_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `additional_note` text,
  `topic` varchar(255) DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `is_important` tinyint(1) DEFAULT '0',
  `is_secret` tinyint(1) DEFAULT '0',
  `is_archived` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `cases`
--

INSERT INTO `cases` (`id`, `file_number`, `case_number`, `police_station_id`, `public_prosecution_id`, `court_id`, `lawyer_id`, `secretary_id`, `case_classification_id`, `counter_case_id`, `case_type_id`, `legal_advisor_id`, `legal_researcher_id`, `fees`, `counterclaim_id`, `start_date`, `additional_note`, `topic`, `branch_id`, `is_important`, `is_secret`, `is_archived`, `status`, `created_at`) VALUES
(139, '20251005192707', 'test123', 3, 3, 2, 80, 92, 2, NULL, 2, 102, 94, '120000.00', NULL, '2025-10-05', 'test', 'مشاجرة', 2, 0, 0, 0, 'active', '2025-10-05 15:27:07'),
(142, '20251013104136', '8765432', 3, 2, 1, 80, 92, 2, NULL, 2, 95, 94, '1000.00', NULL, '2025-09-29', '', 'شيك مستحق ', 3, 0, 0, 0, 'active', '2025-10-13 10:41:36'),
(143, '20251015154917', '2025', 25, 2, 1, 103, 104, 2, NULL, 1, 102, 105, '12000.00', NULL, '2025-10-15', 'اعداد لائحة دعوى ', 'مطالبة مدنية 50 ألف', 3, 0, 0, 0, 'active', '2025-10-15 15:49:17'),
(144, '20251017063654', '370553', 3, 1, 1, 103, 104, 2, NULL, 1, 102, 105, '12000.00', NULL, '2025-10-20', '', 'مطالبة مالية ', 3, 0, 0, 0, 'active', '2025-10-17 06:36:54');

-- --------------------------------------------------------

--
-- بنية الجدول `case_classifications`
--

CREATE TABLE `case_classifications` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_classifications`
--

INSERT INTO `case_classifications` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(1, 'شركة', 'Company', '2025-09-18 06:16:57'),
(2, 'فرد', 'Individual', '2025-09-18 06:16:57');

-- --------------------------------------------------------

--
-- بنية الجدول `case_degrees`
--

CREATE TABLE `case_degrees` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `degree` enum('first_instance','appeal','cassation') NOT NULL DEFAULT 'first_instance',
  `case_number` varchar(20) NOT NULL,
  `year` varchar(13) NOT NULL,
  `referral_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_degrees`
--

INSERT INTO `case_degrees` (`id`, `case_id`, `degree`, `case_number`, `year`, `referral_date`, `created_at`, `updated_at`) VALUES
(45, 139, 'first_instance', '212111', '2025', '2025-10-05 00:00:00', '2025-10-05 15:27:08', '2025-10-05 15:27:08'),
(47, 142, 'first_instance', '123456', '2025', '2025-10-01 00:00:00', '2025-10-13 10:41:38', '2025-10-13 10:41:38'),
(49, 143, 'first_instance', '2025', '2025', '2025-10-15 00:00:00', '2025-10-15 15:49:19', '2025-10-15 15:51:13'),
(50, 144, 'first_instance', '3705', '2025', '2025-10-21 00:00:00', '2025-10-17 06:36:56', '2025-10-17 06:36:56');

-- --------------------------------------------------------

--
-- بنية الجدول `case_documents`
--

CREATE TABLE `case_documents` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_documents`
--

INSERT INTO `case_documents` (`id`, `case_id`, `document_name`, `document_url`, `uploaded_by`, `created_at`) VALUES
(44, 143, 'Cheque return confirmation_ Bank.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760543354852-j14ktjv39vl.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251015%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251015T154915Z&X-Amz-Expires=604800&X-Amz-Signature=8c39bcd4e67ab9bd5b483f5bee7ee2ced9a1259917e73ac262b9407cdca51ae3&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', NULL, '2025-10-15 15:49:17'),
(45, 143, 'Confirmation Of Introduction _Nitin - Copy.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760543354856-5zlslctwb97.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251015%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251015T154915Z&X-Amz-Expires=604800&X-Amz-Signature=d9c6808280a0c102d7089955a5a6b0b7346c25a0fc8efe9cefd733b5140f4586&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', NULL, '2025-10-15 15:49:17');

-- --------------------------------------------------------

--
-- بنية الجدول `case_employees_documents`
--

CREATE TABLE `case_employees_documents` (
  `id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2055) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `case_id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `created at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_employees_documents`
--

INSERT INTO `case_employees_documents` (`id`, `document_name`, `document_url`, `case_id`, `employee_id`, `created at`, `uploaded_by`) VALUES
(20, 'Cheque return confirmation_ Bank.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760543356558-szpqazywr1q.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251015%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251015T154916Z&X-Amz-Expires=604800&X-Amz-Signature=1516a5577ac458055359accb2e6981e3b821521dbe0620b6c2f1e71246115e0c&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 143, NULL, '2025-10-15 15:49:17', NULL),
(21, 'Confirmation Of Introduction _Nitin - Copy.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760543356558-17g9p6g6hla.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251015%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251015T154917Z&X-Amz-Expires=604800&X-Amz-Signature=8f59e88b009dc04645f0616e827449eea02909c0844b3c6eb17ca565131d5e93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 143, NULL, '2025-10-15 15:49:17', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `case_parties`
--

CREATE TABLE `case_parties` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `party_id` int DEFAULT NULL,
  `type` enum('client','opponent') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'client',
  `employee_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_parties`
--

INSERT INTO `case_parties` (`id`, `case_id`, `party_id`, `type`, `employee_id`, `created_at`) VALUES
(70, 139, 17, 'opponent', NULL, '2025-10-05 15:27:07'),
(73, 139, 16, 'client', NULL, '2025-10-05 18:52:32'),
(78, 142, 52, 'client', NULL, '2025-10-13 10:41:37'),
(79, 142, 53, 'opponent', NULL, '2025-10-13 10:41:37'),
(80, 143, NULL, 'client', NULL, '2025-10-15 15:49:18'),
(81, 144, NULL, 'client', NULL, '2025-10-17 06:36:55'),
(82, 144, 53, 'opponent', NULL, '2025-10-17 06:36:55');

-- --------------------------------------------------------

--
-- بنية الجدول `case_parties_documents`
--

CREATE TABLE `case_parties_documents` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `party_id` int DEFAULT NULL,
  `document_name` varchar(2055) NOT NULL,
  `document_url` varchar(2055) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `case_petitions`
--

CREATE TABLE `case_petitions` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `date` date NOT NULL,
  `type` varchar(200) NOT NULL,
  `appeal_date` date NOT NULL,
  `decision` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_petitions`
--

INSERT INTO `case_petitions` (`id`, `case_id`, `date`, `type`, `appeal_date`, `decision`, `created_at`, `updated_at`) VALUES
(44, 139, '2025-10-05', 'منع سفر', '2025-10-12', 0, '2025-10-05 15:27:08', '2025-10-05 15:27:08'),
(47, 142, '2025-09-01', 'امر فتح دعوى', '2025-09-09', 1, '2025-10-13 10:41:38', '2025-10-13 10:41:38'),
(48, 144, '2025-10-13', 'حجز تخفظى ', '2025-10-20', 0, '2025-10-17 06:36:58', '2025-10-17 06:36:58');

-- --------------------------------------------------------

--
-- بنية الجدول `case_petition_documents`
--

CREATE TABLE `case_petition_documents` (
  `id` int NOT NULL,
  `petition_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_petition_documents`
--

INSERT INTO `case_petition_documents` (`id`, `petition_id`, `document_name`, `document_url`, `created_at`) VALUES
(9, 48, 'ÙØ±Ø§Ø± Ø§ÙØ± Ø¹ÙÙ Ø¹Ø±ÙØ¶Ù.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760683016923-7q7kkiwit9x.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251017%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251017T063658Z&X-Amz-Expires=604800&X-Amz-Signature=bdd68038ef546429d3eb8f45cd87391bafb9d2672a81889e730ff16535ee9cb9&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-17 06:36:58');

-- --------------------------------------------------------

--
-- بنية الجدول `case_relations`
--

CREATE TABLE `case_relations` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `related_case_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `case_types`
--

CREATE TABLE `case_types` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_types`
--

INSERT INTO `case_types` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(1, 'مدنية', 'Civil ', '2025-09-18 06:16:57'),
(2, 'جزائية', 'Criminal ', '2025-09-18 06:16:57'),
(3, 'تجارية', 'Commercial ', '2025-09-18 06:16:57');

-- --------------------------------------------------------

--
-- بنية الجدول `clients_deals`
--

CREATE TABLE `clients_deals` (
  `id` int NOT NULL,
  `client_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('normal','yearly') NOT NULL DEFAULT 'normal',
  `status` enum('draft','completed') NOT NULL DEFAULT 'draft',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `clients_deals`
--

INSERT INTO `clients_deals` (`id`, `client_id`, `amount`, `type`, `status`, `start_date`, `end_date`, `created_at`, `created_by`) VALUES
(2, 17, '200.00', 'yearly', 'completed', '2025-10-21', '2025-10-21', '2025-10-08 10:57:38', 90),
(3, 30, '2020.00', 'normal', 'draft', NULL, NULL, '2025-10-10 02:52:46', 90),
(4, 32, '200.00', 'yearly', 'draft', '2025-10-08', '2025-10-29', '2025-10-13 11:45:39', 90),
(6, 53, '120000.00', 'normal', 'draft', NULL, NULL, '2025-10-20 07:13:07', 90),
(7, 52, '5000.00', 'yearly', 'completed', '2025-10-06', '2025-10-13', '2025-10-21 12:28:04', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `courts`
--

CREATE TABLE `courts` (
  `id` int NOT NULL,
  `court_ar` varchar(100) NOT NULL,
  `court_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `courts`
--

INSERT INTO `courts` (`id`, `court_ar`, `court_en`, `created_at`) VALUES
(1, 'محكمة عجمان', 'ajman court', '2025-09-20 19:01:32'),
(2, 'محكمة الشارقة', 'sharjah court', '2025-09-20 19:01:32'),
(3, 'محكمة العين', 'alin court', '2025-09-20 19:25:18');

-- --------------------------------------------------------

--
-- بنية الجدول `court_case_documents`
--

CREATE TABLE `court_case_documents` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `court_case_documents`
--

INSERT INTO `court_case_documents` (`id`, `case_id`, `document_name`, `document_url`, `uploaded_by`, `created_at`) VALUES
(28, 144, 'ÙØ§Ø¦Ø­Ø© Ø¯Ø¹ÙÙ ÙØ­ÙØ¯ Ø­Ø¬Ù.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760683012739-ohzzsxq7jt.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251017%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251017T063654Z&X-Amz-Expires=604800&X-Amz-Signature=e6d7858e24b0d5882aa30e9d80d4a092fba3afe4f27f103061209bd994eb49b1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', NULL, '2025-10-17 06:36:54');

-- --------------------------------------------------------

--
-- بنية الجدول `deal_documents`
--

CREATE TABLE `deal_documents` (
  `id` int NOT NULL,
  `deal_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `deductions`
--

CREATE TABLE `deductions` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `deductions`
--

INSERT INTO `deductions` (`id`, `employee_id`, `date`, `amount`, `reason`, `created_by`, `created_at`) VALUES
(1, 90, '2025-10-01', '250.00', 'غياب', 73, '2025-10-12 04:16:59'),
(3, 114, '2025-10-20', '100.00', 'تأخير', 90, '2025-10-20 10:28:45');

-- --------------------------------------------------------

--
-- بنية الجدول `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `departments`
--

INSERT INTO `departments` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(1, ' القانوني', 'Legal Department', '2025-09-18 06:13:07'),
(2, ' المحاماة', 'Litigation', '2025-09-18 06:13:07'),
(3, ' الاستشارات', 'Consultation', '2025-09-18 06:13:07'),
(4, ' المالي', 'Finance', '2025-09-18 06:13:07'),
(5, ' خدمة العملاء', 'Customer Service ', '2025-09-18 06:13:07'),
(6, ' الموارد البشرية', 'Human Resources', '2025-09-18 06:13:07'),
(7, ' تقنية المعلومات', 'IT', '2025-09-18 06:13:07');

-- --------------------------------------------------------

--
-- بنية الجدول `deposits`
--

CREATE TABLE `deposits` (
  `id` int NOT NULL,
  `bank_account_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `deposit_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `deposits`
--

INSERT INTO `deposits` (`id`, `bank_account_id`, `amount`, `deposit_date`, `created_at`, `created_by`) VALUES
(3, 1, '1200.00', '2025-10-17', '2025-10-17 17:34:58', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `employees`
--

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `job_id` varchar(44) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role_id` int DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `username` varchar(55) NOT NULL,
  `department_id` int DEFAULT NULL,
  `eId` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `passport` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `branch_id` int DEFAULT NULL,
  `direct_manager_id` int DEFAULT NULL,
  `password` varchar(55) NOT NULL,
  `residence_end_date` date DEFAULT NULL,
  `id_end_date` date DEFAULT NULL,
  `passport_end_date` date DEFAULT NULL,
  `labor_card_end_date` date DEFAULT NULL,
  `health_insurance_end_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `contract_type` varchar(50) DEFAULT NULL,
  `bank_name` varchar(50) DEFAULT NULL,
  `iban` varchar(50) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `pay_type` varchar(30) DEFAULT NULL,
  `housing_allowance` varchar(20) DEFAULT NULL,
  `trnsportation_allownce` varchar(20) DEFAULT NULL,
  `last_login` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fisrt_day_of_work` date DEFAULT NULL,
  `another_allownce` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `account_activation_date` date DEFAULT NULL,
  `account_close_date` date DEFAULT NULL,
  `registration_expiration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employees`
--

INSERT INTO `employees` (`id`, `name`, `job_id`, `role_id`, `email`, `phone`, `username`, `department_id`, `eId`, `passport`, `branch_id`, `direct_manager_id`, `password`, `residence_end_date`, `id_end_date`, `passport_end_date`, `labor_card_end_date`, `health_insurance_end_date`, `contract_end_date`, `basic_salary`, `created_at`, `status`, `contract_type`, `bank_name`, `iban`, `account_number`, `pay_type`, `housing_allowance`, `trnsportation_allownce`, `last_login`, `fisrt_day_of_work`, `another_allownce`, `account_activation_date`, `account_close_date`, `registration_expiration_date`) VALUES
(73, 'منتصر محمد سالم', '54321', 3, 'thmansai', '7654321', 'othman', 1, '87654321', NULL, NULL, NULL, '123456', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:22:18', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-19 19:49:23', NULL, '', NULL, NULL, NULL),
(76, 'محمود احمد', '543217', 6, 'thmansai3', '7654321', 'othman33', 1, '87654321', NULL, 3, NULL, '1234563', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:26:04', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-05 16:15:55', NULL, '', NULL, NULL, NULL),
(80, 'مروى مسعد', '54321y7', 3, 'thmansai3', '7654321', 'ytyt', 1, '87654321', NULL, 1, NULL, '1234563u', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:28:09', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-02 17:12:41', NULL, '', NULL, NULL, NULL),
(90, 'admin', 'admin', 1, 'thman.saleh@gmai.lom', '0501455918', 'admin', 3, 'koijknlm', 'kpoiojnlkjkn', 2, 91, '123456', NULL, '2029-09-30', NULL, NULL, '2029-09-30', NULL, '5000.00', '2025-09-20 13:00:56', 'active', 'جزئي', 'DIB', NULL, NULL, 'تحويل بنكي', '500', '500', '2025-10-25 07:32:24', '2025-10-09', '0', '2029-09-30', '2029-09-30', '2029-09-30'),
(91, 'فضل ناصر', '09876', 3, 'THMan@4r4r.com', '0501455918', '81562 ', 3, '567890', '8765', 2, 76, 'othman', '2026-08-11', '2027-02-16', '2026-05-26', '2026-04-21', '2026-03-19', '2026-03-20', '7777.00', '2025-09-20 13:02:15', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-09-20 13:02:15', '2025-11-20', '0', NULL, NULL, '2026-02-11'),
(92, 'منصور علي', '12323', 6, 'othman@123', '0501455918', 'othmansaleh', 5, 'iuytrdesw5', '5432df', 2, 90, 'othman', '2025-09-22', '2025-09-22', '2025-09-22', '2025-09-23', '2025-09-22', '2025-09-22', '3000.00', '2025-09-20 15:21:35', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-20 15:21:35', NULL, '', NULL, NULL, NULL),
(93, 'عبير عبدالستار', '21111', 4, 'thman.saleh@gmai.lom', '0501455918', '77168', 1, '99', '99', 2, 73, '211', '2025-09-17', '2025-09-22', '2025-09-21', '2025-09-17', '2025-09-15', '2025-09-14', '0.00', '2025-09-22 23:48:39', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-06 19:57:44', NULL, '', NULL, NULL, NULL),
(94, 'حمزة سيف', '211', 5, 'thman.saleh@gmai.lom', '211', '211', 3, '211', '211', 2, 90, '211', '2025-09-26', '2025-09-29', '2025-09-28', '2025-09-04', '2025-09-09', '2025-09-07', '211.00', '2025-09-22 23:49:45', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-22 23:49:45', NULL, '', NULL, NULL, NULL),
(95, 'تامر يونس', '11', 4, 'ceo@almstkshf.com', '0585400191', 'tamer', 3, '', '', 3, 90, '1234', '2025-10-31', '2025-10-30', '2025-10-30', '2025-10-30', '2025-10-30', '2025-10-30', '1000.00', '2025-10-05 20:17:14', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-06 00:17:14', NULL, '', NULL, NULL, NULL),
(96, 'راشد المنصوري', '2002', 3, 'john.smith@email.com', '0501455918', '2002', 5, '098765432', '8282828', 3, 90, '278426', '2025-10-10', '2025-10-09', '2025-10-08', '2025-10-14', '2025-09-29', '2025-10-22', '4000.00', '2025-10-10 08:00:02', 'active', 'كامل', 'بنك دبي الاسلامي', '9876545678765434567', '76543245456765', 'تحويل بنكي', '500', '700', '2025-10-10 12:00:02', '2025-10-22', '500', '2025-10-13', '2025-10-15', NULL),
(97, 'ali', '4949', 10, 'thman.saleh@gmail.com', '050145094', '4949', 6, '7765645667754', '8765438654', 2, 95, '111111', '2025-10-10', '2025-10-08', '2025-10-22', '2025-10-14', '2025-10-07', '2025-10-12', '8000.00', '2025-10-13 02:01:46', 'active', 'كامل', 'FAB', '3456789087654', '98765456789', 'شيك', '500', '500', '2025-10-24 22:58:11', '2025-10-21', '0', '2025-10-14', '2025-10-28', '2025-10-19'),
(102, 'شريف ', 'sherif', 4, 'essawys9999@gmail.com', '0556829149', 'sherif', 3, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:22:42', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-22 16:07:22', NULL, '0', NULL, NULL, NULL),
(103, 'محمد بنى هاشم ', 'mbh', 3, 'dfgdjj@gmail.com', '0555555555', 'mbh', 2, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:24:21', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-25 00:12:29', NULL, '0', NULL, NULL, NULL),
(104, 'رنا ', 'rana', 6, 'rana@gmail.com', '05555555', 'rana', 5, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:37:42', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 10:03:32', NULL, '0', NULL, NULL, NULL),
(105, 'suhaa', 'suha', 5, 'suha@gmail.com', '0555555', 'suha', 1, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:40:57', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 10:13:47', NULL, '0', NULL, NULL, NULL),
(108, 'شريف 2', '5700', 4, 'sherif@gmail.com', '0500000000', '5700', 3, NULL, NULL, 3, NULL, '339420', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:54:28', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-15 20:07:30', NULL, '0', NULL, NULL, NULL),
(113, 'رنا على  ', 'rana ali ', 6, 'rana@gmail.com', '0555555555', 'rana ali ', 3, NULL, NULL, 3, NULL, '221333', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-17 05:57:36', 'active', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 09:57:36', NULL, '0', NULL, NULL, NULL),
(114, 'Ashly Philip', 'MBH-AJM/Acc/60', 7, 'ashly-accounts@mbhadvocates.com', '0501122334', 'MBH-AJM/Acc/60', 4, '784-1998-4697762-9', 'P9839936', 3, 103, '718672', '2025-10-31', NULL, '2025-10-26', '2025-10-29', '2025-10-22', '2025-10-29', '1000.00', '2025-10-20 10:17:08', 'active', 'كامل', 'ADCB', NULL, NULL, 'wps', '1000', '1000', '2025-10-20 14:17:08', '2025-10-01', '1000', '2025-10-20', NULL, '2025-10-22');

-- --------------------------------------------------------

--
-- بنية الجدول `employee_attendance`
--

CREATE TABLE `employee_attendance` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `checkin` datetime NOT NULL,
  `checkout` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employee_attendance`
--

INSERT INTO `employee_attendance` (`id`, `employee_id`, `checkin`, `checkout`, `created_at`, `created_by`) VALUES
(1, 90, '2025-10-09 04:17:00', '2025-10-09 13:00:00', '2025-10-12 03:15:58', 73),
(5, 96, '2025-10-01 08:00:00', '2025-10-01 17:00:00', '2025-10-12 08:24:36', 73),
(7, 97, '2025-10-02 09:12:00', '2025-10-02 16:00:00', '2025-10-13 02:59:57', 90),
(8, 114, '2025-10-20 05:10:00', '2025-10-20 13:00:00', '2025-10-20 10:28:25', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `employee_documents`
--

CREATE TABLE `employee_documents` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `document_type` enum('cv','id','passport','insurance','contract','others','good_conduct','work_permit','education_certificate') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employee_documents`
--

INSERT INTO `employee_documents` (`id`, `employee_id`, `document_type`, `document_name`, `document_url`, `created_at`, `uploaded_by`) VALUES
(3, 90, 'passport', 'Ø³ÙØ±Ø©.webp', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760167808496-e8t7zw6jsgj.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251011%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251011T073010Z&X-Amz-Expires=604800&X-Amz-Signature=cc84cfc8093c8ea114368de22a9151822a3a20d454fea405e275b98905d6f700&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-11 07:30:10', 90),
(5, 90, 'id', 'Ø³ÙØ±Ø©.webp', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760168520892-pruqc8yirt.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251011%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251011T074202Z&X-Amz-Expires=604800&X-Amz-Signature=68f0c74b8a92a22d34afb11b96804b5fecae8b6d3664cdc61f2d10bdc0800fdc&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-11 07:42:03', 90),
(6, 90, 'cv', 'sessions_1760147239630-6h95klq91l4.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760169125934-pl8wftqumn.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251011%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251011T075207Z&X-Amz-Expires=604800&X-Amz-Signature=849298709d2e38d5283317955a241d49e6af8f1c8a29b898c5bed3641f48c8ba&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-11 07:52:07', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `employee_permissions`
--

CREATE TABLE `employee_permissions` (
  `id` int NOT NULL,
  `permission_id` int NOT NULL,
  `employee_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employee_permissions`
--

INSERT INTO `employee_permissions` (`id`, `permission_id`, `employee_id`) VALUES
(49, 36, 96),
(63, 36, 90),
(64, 52, 90),
(65, 40, 90),
(66, 39, 90),
(67, 31, 90),
(68, 43, 90),
(69, 38, 90),
(70, 54, 90),
(71, 30, 90),
(72, 42, 90),
(73, 45, 90),
(74, 41, 90),
(75, 40, 95),
(76, 39, 95),
(77, 51, 95),
(78, 62, 95),
(79, 37, 95),
(83, 64, 97),
(84, 41, 97),
(85, 39, 80),
(185, 36, 105),
(186, 52, 105),
(187, 48, 105),
(188, 68, 105),
(189, 76, 105),
(190, 80, 105),
(191, 60, 105),
(192, 64, 105),
(193, 72, 105),
(194, 32, 105),
(195, 56, 105),
(196, 44, 105),
(197, 28, 105),
(198, 40, 105),
(199, 39, 105),
(200, 55, 105),
(201, 51, 105),
(202, 71, 105),
(203, 79, 105),
(204, 83, 105),
(205, 63, 105),
(206, 67, 105),
(207, 75, 105),
(208, 35, 105),
(209, 59, 105),
(210, 47, 105),
(211, 31, 105),
(212, 43, 105),
(213, 38, 105),
(214, 54, 105),
(215, 50, 105),
(216, 70, 105),
(217, 78, 105),
(218, 82, 105),
(219, 62, 105),
(220, 66, 105),
(221, 74, 105),
(222, 34, 105),
(223, 58, 105),
(224, 46, 105),
(225, 30, 105),
(226, 42, 105),
(227, 37, 105),
(228, 53, 105),
(229, 49, 105),
(230, 69, 105),
(231, 77, 105),
(232, 81, 105),
(233, 61, 105),
(234, 65, 105),
(235, 73, 105),
(236, 33, 105),
(237, 57, 105),
(238, 45, 105),
(239, 29, 105),
(240, 41, 105),
(241, 36, 108),
(242, 52, 108),
(243, 48, 108),
(244, 68, 108),
(245, 76, 108),
(246, 80, 108),
(247, 60, 108),
(248, 64, 108),
(249, 72, 108),
(250, 32, 108),
(251, 56, 108),
(252, 44, 108),
(253, 28, 108),
(254, 40, 108),
(255, 39, 108),
(256, 55, 108),
(257, 51, 108),
(258, 71, 108),
(259, 79, 108),
(260, 83, 108),
(261, 63, 108),
(262, 67, 108),
(263, 75, 108),
(264, 35, 108),
(265, 59, 108),
(266, 47, 108),
(267, 31, 108),
(268, 43, 108),
(269, 38, 108),
(270, 54, 108),
(271, 50, 108),
(272, 70, 108),
(273, 78, 108),
(274, 82, 108),
(275, 62, 108),
(276, 66, 108),
(277, 74, 108),
(278, 34, 108),
(279, 58, 108),
(280, 46, 108),
(281, 30, 108),
(282, 42, 108),
(283, 37, 108),
(284, 53, 108),
(285, 49, 108),
(286, 69, 108),
(287, 77, 108),
(288, 81, 108),
(289, 61, 108),
(290, 65, 108),
(291, 73, 108),
(292, 33, 108),
(293, 57, 108),
(294, 45, 108),
(295, 29, 108),
(296, 41, 108),
(297, 36, 113),
(298, 52, 113),
(299, 54, 113),
(300, 48, 113),
(301, 68, 113),
(302, 70, 113),
(303, 71, 113),
(304, 69, 113),
(305, 76, 113),
(306, 78, 113),
(307, 79, 113),
(308, 77, 113),
(309, 60, 113),
(310, 61, 113),
(311, 64, 113),
(312, 65, 113),
(313, 72, 113),
(314, 73, 113),
(315, 74, 113),
(316, 33, 113),
(317, 32, 113),
(318, 56, 113),
(319, 57, 113),
(320, 44, 113),
(321, 45, 113),
(322, 28, 113),
(323, 29, 113),
(324, 40, 113),
(325, 41, 113),
(438, 36, 102),
(439, 52, 102),
(440, 48, 102),
(441, 68, 102),
(442, 76, 102),
(443, 60, 102),
(444, 64, 102),
(445, 72, 102),
(446, 32, 102),
(447, 56, 102),
(448, 44, 102),
(449, 28, 102),
(450, 40, 102),
(451, 35, 102),
(452, 34, 102),
(453, 37, 102),
(454, 53, 102),
(455, 49, 102),
(456, 69, 102),
(457, 77, 102),
(458, 61, 102),
(459, 65, 102),
(460, 73, 102),
(461, 33, 102),
(462, 57, 102),
(463, 45, 102),
(464, 29, 102),
(465, 41, 102),
(466, 36, 104),
(467, 52, 104),
(468, 48, 104),
(469, 68, 104),
(470, 76, 104),
(471, 80, 104),
(472, 60, 104),
(473, 64, 104),
(474, 72, 104),
(475, 32, 104),
(476, 56, 104),
(477, 44, 104),
(478, 28, 104),
(479, 40, 104),
(480, 74, 104),
(481, 37, 104),
(482, 53, 104),
(483, 49, 104),
(484, 69, 104),
(485, 77, 104),
(486, 81, 104),
(487, 61, 104),
(488, 65, 104),
(489, 73, 104),
(490, 33, 104),
(491, 57, 104),
(492, 45, 104),
(493, 29, 104),
(494, 41, 104),
(838, 99, 103),
(839, 107, 103),
(840, 36, 103),
(841, 52, 103),
(842, 48, 103),
(843, 68, 103),
(844, 76, 103),
(845, 80, 103),
(846, 60, 103),
(847, 95, 103),
(848, 87, 103),
(849, 64, 103),
(850, 72, 103),
(851, 91, 103),
(852, 56, 103),
(853, 44, 103),
(854, 28, 103),
(855, 40, 103),
(856, 102, 103),
(857, 39, 103),
(858, 55, 103),
(859, 51, 103),
(860, 71, 103),
(861, 79, 103),
(862, 83, 103),
(863, 63, 103),
(864, 98, 103),
(865, 90, 103),
(866, 67, 103),
(867, 75, 103),
(868, 35, 103),
(869, 94, 103),
(870, 59, 103),
(871, 47, 103),
(872, 31, 103),
(873, 43, 103),
(874, 106, 103),
(875, 101, 103),
(876, 109, 103),
(877, 38, 103),
(878, 54, 103),
(879, 50, 103),
(880, 70, 103),
(881, 78, 103),
(882, 82, 103),
(883, 62, 103),
(884, 97, 103),
(885, 89, 103),
(886, 66, 103),
(887, 74, 103),
(888, 34, 103),
(889, 93, 103),
(890, 58, 103),
(891, 46, 103),
(892, 30, 103),
(893, 42, 103),
(894, 105, 103),
(895, 100, 103),
(896, 108, 103),
(897, 37, 103),
(898, 53, 103),
(899, 49, 103),
(900, 69, 103),
(901, 77, 103),
(902, 81, 103),
(903, 61, 103),
(904, 96, 103),
(905, 103, 103),
(906, 88, 103),
(907, 65, 103),
(908, 73, 103),
(909, 33, 103),
(910, 92, 103),
(911, 57, 103),
(912, 45, 103),
(913, 29, 103),
(914, 41, 103),
(915, 104, 103);

-- --------------------------------------------------------

--
-- بنية الجدول `employee_requests`
--

CREATE TABLE `employee_requests` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `type` varchar(100) NOT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `manager_approval` enum('pending','approved','rejected') DEFAULT 'pending',
  `hr_approval` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employee_requests`
--

INSERT INTO `employee_requests` (`id`, `employee_id`, `date`, `type`, `from_date`, `to_date`, `manager_approval`, `hr_approval`, `created_by`, `created_at`) VALUES
(1, 96, '2025-10-07', 'اجازة ابوية', '2025-10-10', '2025-10-23', 'approved', 'approved', 73, '2025-10-12 08:01:29'),
(2, 95, '2025-10-01', 'شهادة لا مانع', NULL, NULL, 'approved', 'approved', 73, '2025-10-12 08:51:26'),
(4, 93, '2025-10-13', 'اخرى', NULL, NULL, 'approved', 'pending', 90, '2025-10-13 03:53:38'),
(6, 97, '2025-10-09', 'شهادة خبرة', NULL, NULL, 'pending', 'pending', 90, '2025-10-13 10:52:04'),
(7, 91, '2025-10-09', 'شهادة خبرة', NULL, NULL, 'pending', 'rejected', 97, '2025-10-14 22:41:12'),
(8, 102, '2025-10-14', 'اجازة مرضية', '2025-10-26', '2025-10-28', 'rejected', 'rejected', 90, '2025-10-15 15:30:16'),
(9, 108, '2025-10-15', 'اجازة سنوية', '2025-11-01', '2025-11-15', 'approved', 'approved', 108, '2025-10-15 16:04:50'),
(10, 114, '2025-10-26', 'اجازة امومية', '2025-10-24', '2025-10-29', 'approved', 'approved', 90, '2025-10-20 11:08:55'),
(11, 80, '2025-10-02', 'اجازة سنوية', '2025-10-01', '2025-10-15', 'pending', 'pending', 90, '2025-10-20 19:08:37'),
(15, 95, '2025-10-22', 'اجازة التفرغ لإداء الخدمة الوطنية', '2025-10-23', '2025-10-31', 'approved', 'pending', 90, '2025-10-22 03:59:38');

-- --------------------------------------------------------

--
-- بنية الجدول `events`
--

CREATE TABLE `events` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `place` varchar(255) DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `events`
--

INSERT INTO `events` (`id`, `title`, `place`, `event_date`, `start_time`, `end_time`, `description`, `created_at`, `created_by`) VALUES
(2, 'ورشة عمل', 'فندق العنوان', '2025-10-07', '09:00:00', '11:00:00', 'meetings', '2025-10-13 05:54:04', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `event_attendance`
--

CREATE TABLE `event_attendance` (
  `id` int NOT NULL,
  `event_id` int NOT NULL,
  `employee_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `event_attendance`
--

INSERT INTO `event_attendance` (`id`, `event_id`, `employee_id`) VALUES
(27, 2, 73),
(28, 2, 76),
(29, 2, 80),
(30, 2, 92),
(31, 2, 97);

-- --------------------------------------------------------

--
-- بنية الجدول `executions`
--

CREATE TABLE `executions` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `employee_id` int DEFAULT NULL,
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `executions`
--

INSERT INTO `executions` (`id`, `case_id`, `number`, `date`, `type`, `amount`, `status`, `employee_id`, `note`, `created_at`) VALUES
(31, 139, '', '2025-10-06', 'مصادرة امواال', '9000.00', 'in_progress', NULL, NULL, '2025-10-05 15:27:09'),
(33, 142, NULL, '2025-10-01', 'منع من السفر', '500000.00', 'in_progress', NULL, NULL, '2025-10-13 10:41:40');

-- --------------------------------------------------------

--
-- بنية الجدول `executions_documents`
--

CREATE TABLE `executions_documents` (
  `id` int NOT NULL,
  `execution_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `external_links`
--

CREATE TABLE `external_links` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `link` varchar(500) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `external_links`
--

INSERT INTO `external_links` (`id`, `title`, `link`, `created_by`, `created_at`) VALUES
(1, 'وزارة الداخلية', 'https://moi.gov.ae/', 90, '2025-10-17 10:36:29'),
(2, 'محاكم دبي', 'https://www.dc.gov.ae/PublicServices/Home.aspx', 90, '2025-10-17 10:38:47'),
(3, 'وزارة العدل', 'https://www.moj.gov.ae', 90, '2025-10-17 10:39:41'),
(4, 'نيابة دبي', 'https://www.dxbpp.gov.ae/', 90, '2025-10-17 10:40:15');

-- --------------------------------------------------------

--
-- بنية الجدول `forms`
--

CREATE TABLE `forms` (
  `id` int NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `document_for` enum('early leave','car acknowledgement letter','annual leave encashment','employee information','emergency leave','email acknowledgement','acknowledgement letter','end of service acknowledgement','loan','leave application','sickness self certificate','short absent','salary advance','new starter','others') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `forms`
--

INSERT INTO `forms` (`id`, `document_url`, `document_for`, `created_at`) VALUES
(1, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Salary%20Advance%20Form.docx', 'salary advance', '2025-10-15 01:33:06'),
(2, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Annual%20Leave%20Encashment%20Letter.pdf', 'annual leave encashment', '2025-10-15 01:33:06'),
(3, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Car%20Acknowledgement%20Letter.pdf', 'car acknowledgement letter', '2025-10-15 01:37:24'),
(4, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Early%20Leave%20Form%20.pdf', 'early leave', '2025-10-15 01:37:24'),
(5, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Email%20Acknowledgement%20Letter.docx', 'email acknowledgement', '2025-10-15 01:37:24'),
(6, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Emergency%20Leave%20Form%20.pdf', 'emergency leave', '2025-10-15 01:37:24'),
(7, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Employee%20Information%20Form.docx', 'employee information', '2025-10-15 01:37:24'),
(8, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/General%20Acknowledgement%20Letter.docx', 'acknowledgement letter', '2025-10-15 01:39:54'),
(9, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Leave%20Application%20Form.pdf', 'leave application', '2025-10-15 01:39:54'),
(10, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Loan%20form.docx', 'loan', '2025-10-15 01:39:54'),
(11, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Short%20Absent%20Form.pdf', 'short absent', '2025-10-15 01:41:10'),
(12, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Sickness%20self-certificate.pdf', 'sickness self certificate', '2025-10-15 01:41:10');

-- --------------------------------------------------------

--
-- بنية الجدول `goaml`
--

CREATE TABLE `goaml` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('compliant','safe','under_review') DEFAULT 'under_review',
  `note` text,
  `type` varchar(55) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `goaml`
--

INSERT INTO `goaml` (`id`, `name`, `phone`, `status`, `note`, `type`, `created_by`, `created_at`) VALUES
(7, '76543', '87654', 'compliant', NULL, 'منظمة', 90, '2025-10-22 23:43:52');

-- --------------------------------------------------------

--
-- بنية الجدول `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `invoice_date` date NOT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `client_id` int DEFAULT NULL,
  `referred_by_employee_id` int DEFAULT NULL,
  `bank_account_id` int NOT NULL,
  `status` enum('draft','issued','paid','cancelled') NOT NULL DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_date`, `invoice_number`, `amount`, `client_id`, `referred_by_employee_id`, `bank_account_id`, `status`, `created_at`, `created_by`) VALUES
(2, '2025-10-21', 'INV-2025-00002', '221.53', 52, 97, 2, 'paid', '2025-10-24 11:40:41', 90),
(3, '2025-10-24', 'INV-2025-00003', '42000.00', 59, 95, 2, 'paid', '2025-10-24 14:52:30', 90),
(4, '2025-10-25', 'INV-2025-00004', '1680.00', 52, 103, 2, 'draft', '2025-10-25 00:29:54', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `description`, `amount`) VALUES
(2, 2, 'test', '210.98'),
(3, 3, 't33', '40000.00'),
(4, 4, 'رسوم المحكمة', '1500.00'),
(5, 4, 'طباعة ', '100.00');

-- --------------------------------------------------------

--
-- بنية الجدول `judicial_orders`
--

CREATE TABLE `judicial_orders` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `date` date DEFAULT NULL,
  `status` enum('pending','executed','appealed','cancelled') DEFAULT 'pending',
  `service_completed` tinyint(1) NOT NULL DEFAULT '0',
  `notification_period_days` varchar(11) NOT NULL,
  `case_filed` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `judicial_orders`
--

INSERT INTO `judicial_orders` (`id`, `case_id`, `date`, `status`, `service_completed`, `notification_period_days`, `case_filed`, `created_at`) VALUES
(18, 139, '2025-10-04', 'pending', 1, '14', 0, '2025-10-05 15:27:09'),
(20, 142, '2025-09-02', 'pending', 1, '15', 1, '2025-10-13 10:41:40');

-- --------------------------------------------------------

--
-- بنية الجدول `judicial_orders_documents`
--

CREATE TABLE `judicial_orders_documents` (
  `id` int NOT NULL,
  `judicial_order_id` int NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `employee_id` int DEFAULT NULL,
  `created at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `leaves`
--

CREATE TABLE `leaves` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `leave_type` enum('annual','sick','emergency','maternity','unpaid') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `duration_days` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `litigation_degrees`
--

CREATE TABLE `litigation_degrees` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `litigation_degrees`
--

INSERT INTO `litigation_degrees` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(26, 'المحكمة الابتدائية', 'Primary Court', '2025-09-18 06:21:35'),
(27, 'محكمة الاستئناف', 'Court of Appeal', '2025-09-18 06:21:35'),
(28, 'المحكمة العليا', 'Supreme Court', '2025-09-18 06:21:35'),
(29, 'المحكمة التجارية', 'Commercial Court', '2025-09-18 06:21:35'),
(30, 'محكمة التنفيذ', 'Execution Court', '2025-09-18 06:21:35');

-- --------------------------------------------------------

--
-- بنية الجدول `logs`
--

CREATE TABLE `logs` (
  `id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `action` enum('add','update','delete','login','other') NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `meetings`
--

CREATE TABLE `meetings` (
  `id` int NOT NULL,
  `party_id` int NOT NULL,
  `note` text,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `meeting_type` enum('online','onsite') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `lawyer_id` int DEFAULT NULL,
  `meet_result` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `meetings`
--

INSERT INTO `meetings` (`id`, `party_id`, `note`, `date`, `start_time`, `end_time`, `meeting_type`, `address`, `lawyer_id`, `meet_result`, `created_at`, `created_by`) VALUES
(15, 30, 'test', '2025-11-04', '01:00:00', '01:13:00', 'onsite', '123 Main Street, Downtown', NULL, 'rescheduled', '2025-10-21 14:52:51', NULL),
(16, 59, 'test', '2025-10-21', '13:00:00', '13:01:00', 'onsite', 'Dubai', NULL, 'cancelled', '2025-10-21 14:55:12', NULL),
(17, 61, NULL, '2025-10-23', '08:05:00', '08:49:00', 'onsite', NULL, NULL, 'scheduled', '2025-10-22 12:05:31', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `meetings_documents`
--

CREATE TABLE `meetings_documents` (
  `id` int NOT NULL,
  `meeting_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `meeting_attendance`
--

CREATE TABLE `meeting_attendance` (
  `attendance_id` int NOT NULL,
  `meeting_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `meeting_attendance`
--

INSERT INTO `meeting_attendance` (`attendance_id`, `meeting_id`, `employee_id`, `created_at`) VALUES
(7, 15, 94, '2025-10-21 15:48:39'),
(8, 15, 95, '2025-10-21 15:48:39'),
(9, 15, 103, '2025-10-21 15:48:39'),
(10, 15, 104, '2025-10-21 15:48:39'),
(11, 16, 76, '2025-10-21 15:48:55'),
(12, 16, 80, '2025-10-21 15:48:55');

-- --------------------------------------------------------

--
-- بنية الجدول `memos`
--

CREATE TABLE `memos` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `submission_date` date NOT NULL,
  `description` text,
  `is_lawyer_approved` tinyint(1) DEFAULT '0',
  `is_secretary_approved` tinyint(1) DEFAULT '0',
  `is_consultant_approved` tinyint(1) DEFAULT '0',
  `is_admin_approved` tinyint(1) DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `status` enum('Draft','Pending Approval','Approved','Submitted to Court','Rejected') DEFAULT 'Draft',
  `admin_note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_status` enum('Draft','Pending Approval','Submitted to Court','Approved','Rejected') NOT NULL DEFAULT 'Draft',
  `secretary_status` enum('Rejected','Draft','Approved','Submitted to Court','Pending Approval') NOT NULL DEFAULT 'Draft',
  `consultant_status` enum('Rejected','Draft','Approved','Submitted to Court','Pending Approval') NOT NULL DEFAULT 'Draft',
  `lawyer_status` enum('Rejected','Draft','Approved','Submitted to Court','Pending Approval') NOT NULL DEFAULT 'Draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `memos`
--

INSERT INTO `memos` (`id`, `case_id`, `title`, `submission_date`, `description`, `is_lawyer_approved`, `is_secretary_approved`, `is_consultant_approved`, `is_admin_approved`, `created_by`, `status`, `admin_note`, `created_at`, `admin_status`, `secretary_status`, `consultant_status`, `lawyer_status`) VALUES
(37, 139, 'تقديم عريضة', '2025-10-05', 'test', 0, 0, 0, 1, 73, 'Approved', '', '2025-10-05 15:27:10', 'Approved', 'Draft', 'Draft', 'Approved'),
(40, 142, 'دفوع', '2025-10-13', 'دفوع قانونية ', 0, 0, 0, 0, 90, 'Draft', '', '2025-10-13 10:41:41', 'Approved', 'Draft', 'Draft', 'Draft'),
(41, 143, 'مذكرة جوابيه ', '2025-10-31', 'مذكرة جوابيه ', 0, 0, 0, 0, 105, 'Pending Approval', 'مذكرة جوابيه ', '2025-10-15 15:50:35', 'Draft', 'Draft', 'Draft', 'Draft'),
(42, 143, 'مذكرة جوابيه ', '2025-10-28', 'مذكرة جوابيه ', 0, 0, 0, 0, 108, 'Pending Approval', 'مذكرة جوابيه ', '2025-10-15 16:00:56', 'Approved', 'Draft', 'Draft', 'Draft');

-- --------------------------------------------------------

--
-- بنية الجدول `memo_documents`
--

CREATE TABLE `memo_documents` (
  `id` int NOT NULL,
  `memo_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `documen_url` varchar(2000) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `other_leaves`
--

CREATE TABLE `other_leaves` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `total_days` int NOT NULL,
  `remaining_days` int DEFAULT '0',
  `leave_reason` enum('maternity','paternity','study','emergency','others') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `leave_type` enum('paid','unpaid') NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `other_leaves`
--

INSERT INTO `other_leaves` (`id`, `employee_id`, `date`, `from_date`, `to_date`, `total_days`, `remaining_days`, `leave_reason`, `leave_type`, `created_by`, `created_at`) VALUES
(1, 90, '2025-10-08', '2025-10-08', '2025-10-08', 1, 12, 'study', 'unpaid', 73, '2025-10-12 05:11:39'),
(2, 114, '2025-10-20', '2025-10-27', '2025-11-01', 6, 24, 'paternity', 'paid', 90, '2025-10-20 11:03:06');

-- --------------------------------------------------------

--
-- بنية الجدول `parties`
--

CREATE TABLE `parties` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `branch_id` int DEFAULT NULL,
  `category` enum('individual','company') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `party_type` enum('client','opponent','New','Unqualified','Contacted','Qualified') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `passport` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `is_vip` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `e_id` varchar(55) DEFAULT NULL,
  `source` varchar(100) DEFAULT NULL,
  `consultation_type` varchar(100) DEFAULT NULL,
  `nationality` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `parties`
--

INSERT INTO `parties` (`id`, `name`, `phone`, `address`, `branch_id`, `category`, `email`, `party_type`, `passport`, `username`, `password`, `status`, `is_vip`, `created_by`, `created_at`, `e_id`, `source`, `consultation_type`, `nationality`) VALUES
(11, ' أحمد علي', ' +971501234567', ' شارع الملك، دبيlisfhjgoijog', 1, 'individual', ' ahmed.ali@example.com', 'client', NULL, ' ahmed.ali', ' securepassword123', 'active', 0, NULL, '2025-09-19 22:15:30', NULL, NULL, NULL, 'اليمن'),
(15, 'ماهر الكتبي', ' +971501234567', ' شارع الملك، دبيlisfhjgoijog', 1, 'individual', ' ahmed.ali@exasmple.comd', 'client', NULL, ' wdffs.ali', ' securepassword123', 'active', 0, NULL, '2025-09-19 22:17:34', '654321`', NULL, NULL, 'اليمن'),
(16, 'عبدالله سعيد', '+971501455918', 'ابو هيل\n111', 1, 'individual', 'thman.saleh@gmail.com', 'client', '', 'othman', 'othman', 'active', 0, NULL, '2025-09-21 05:05:53', '7654321', NULL, '', 'hgrrr'),
(17, 'منتصر خلف الله', '+9715014455918', 'ابو هيل\n111', 1, 'company', 'thman.saleh@gmail.com', 'opponent', NULL, '432', 'othman', 'active', 0, NULL, '2025-09-21 05:09:23', '7654321', NULL, NULL, 'hgrrr'),
(18, 'خالد المري', '+971501455918', 'dubai deirah', 1, 'company', 'ahmed.ali@example.com', 'opponent', NULL, 'khiled', 'othman', 'active', 0, NULL, '2025-09-21 05:40:47', '7654321', NULL, NULL, 'الامارات'),
(19, 'مروان علي', '+971501455918', 'دبي ديرة', 1, 'individual', 'john.doe@example.com', 'opponent', NULL, '77168', '4333', 'inactive', 0, NULL, '2025-09-21 13:37:57', '76543216543', NULL, NULL, 'العراق'),
(20, 'عثمان صالح عبدالحميد', '0501455918', 'ابو هيل\n111', 1, 'company', '322', 'client', NULL, 'admin', '123456', 'active', 0, NULL, '2025-09-30 10:41:07', '', NULL, NULL, '22'),
(22, 'عثمان صالح عبدالحميد', '0501455918', 'ابو هيل\n111', 1, 'company', 'john.smith@email.com', 'opponent', NULL, 'tgref', '123456', 'active', 0, NULL, '2025-09-30 10:43:50', '2121', NULL, NULL, 'hgrrr'),
(30, 'حمدان رائد', '0501455918', '', 2, 'company', 'hamdan@gmail.com', 'opponent', NULL, '765432', '654333', 'active', 0, NULL, '2025-10-08 00:55:52', '', NULL, NULL, ''),
(31, 'ali nour', '+971501455918', 'مريننا', 2, 'individual', '', 'opponent', NULL, '981539', '457298', 'active', 0, NULL, '2025-10-08 11:43:54', '', NULL, NULL, ''),
(32, 'طلال محمد', '0501455918', NULL, 2, 'individual', NULL, 'client', NULL, '812983', '574829', 'active', 0, NULL, '2025-10-08 12:43:58', NULL, NULL, NULL, NULL),
(33, 'othman', '050123567', '9ouied', 3, 'company', '', 'New', '', '86754tr', 'iuyjhtgrfre', 'active', 0, NULL, '2025-10-08 23:35:27', '', 'زيارة المكتب', 'مالية', ''),
(39, 'عثمان صالح عبدالحميد', '+971501455918', 'ابو هيل\n111', 2, 'company', '', 'opponent', NULL, '957346', '702194', 'active', 0, NULL, '2025-10-09 01:34:52', '', NULL, NULL, ''),
(52, 'المستكشف للتطوير و الرصد الاعلامي', '0585952035', '', 1, 'company', 'rased@almstkshf.com', 'client', '', '843844', '649044', 'active', 1, 90, '2025-10-13 10:31:33', '', NULL, '', ''),
(53, 'محمد حماد', '0585454541', '', 1, 'individual', '', 'opponent', NULL, '639350', '526704', 'active', 0, 90, '2025-10-13 10:32:26', '', NULL, NULL, ''),
(55, 'علي محمد ', '0501234567', '', 1, 'individual', 'ali@gmail.com', 'New', '', '139367', '653476', 'active', 0, 90, '2025-10-17 06:09:00', '', 'زيارة المكتب', 'قانونية', ''),
(57, 'تامر', '+971585400191', '', 1, 'individual', '', 'client', '', '250346', '419736', 'active', 0, 90, '2025-10-20 04:57:50', '784197941306025', NULL, '', ''),
(58, 'شريف جمال ', '+971556829149', '', 3, 'individual', '', 'client', '', '779807', '980565', 'active', 0, 90, '2025-10-20 04:59:26', '', NULL, '', ''),
(59, 'شريف 0 ', '+9715550000000', '', 1, 'individual', '', 'client', '', '665401', '345895', 'active', 0, 90, '2025-10-20 06:58:46', '', NULL, '', ''),
(61, 'محمد حجي', '0097105555555', '', 3, 'individual', '', 'New', '', '835744', '676296', 'active', 0, 90, '2025-10-22 12:04:43', '', 'زيارة المكتب', '', ''),
(63, 'احمد شاه البلوش ', '+971556829149', '', 1, 'individual', '', 'client', NULL, '362804', '503277', 'active', 0, 90, '2025-10-22 12:55:45', '', NULL, NULL, '');

-- --------------------------------------------------------

--
-- بنية الجدول `parties_documents`
--

CREATE TABLE `parties_documents` (
  `id` int NOT NULL,
  `party_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `document_url` varchar(2055) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `parties_documents`
--

INSERT INTO `parties_documents` (`id`, `party_id`, `document_name`, `uploaded_by`, `created_at`, `document_url`) VALUES
(19, 16, 'Salary Advance Form (1).docx', NULL, '2025-10-19 13:03:05', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760878984019-b93owsbs4km.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251019%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251019T130305Z&X-Amz-Expires=604800&X-Amz-Signature=ba6e63563f4ea74e4f0eae91fa7e5678d68e7d588585ce918a4e75fefb8ed066&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject');

-- --------------------------------------------------------

--
-- بنية الجدول `parties_orders`
--

CREATE TABLE `parties_orders` (
  `id` int NOT NULL,
  `party_id` int NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` enum('new','approved','pending','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'new',
  `case_number` varchar(100) DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `parties_orders`
--

INSERT INTO `parties_orders` (`id`, `party_id`, `type`, `date`, `status`, `case_number`, `details`, `created_at`, `created_by`) VALUES
(10, 20, 'case_details', '2025-10-11', 'approved', NULL, NULL, '2025-10-14 01:39:58', 90),
(11, 20, 'case_details', '2025-10-29', 'pending', NULL, NULL, '2025-10-14 01:47:54', 90),
(12, 32, 'case_details', '2025-10-01', 'pending', 'test', NULL, '2025-10-14 01:49:59', 90),
(16, 16, 'test', '2025-10-19', 'rejected', NULL, 'test', '2025-10-19 13:18:37', NULL),
(19, 30, 'موعد', '2025-10-08', 'pending', NULL, NULL, '2025-10-19 13:36:16', 90),
(21, 16, 'طلب مستند', '2025-10-19', 'pending', NULL, 'test', '2025-10-19 13:45:45', NULL),
(26, 16, 'استفسار مالي', '2025-10-19', 'pending', NULL, 'كم المطلوب دفعخ', '2025-10-19 15:10:23', NULL),
(28, 52, 'طلب مستند', '2025-10-25', 'pending', NULL, 'test', '2025-10-25 02:52:32', NULL),
(29, 52, 'موعد', '2025-10-25', 'pending', NULL, 'test', '2025-10-25 02:54:03', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `permission_ar` varchar(100) NOT NULL,
  `permission_en` varchar(100) NOT NULL,
  `permission_group_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `permissions`
--

INSERT INTO `permissions` (`id`, `permission_ar`, `permission_en`, `permission_group_name`, `created_at`) VALUES
(28, 'إضافة جلسة', 'Add Session', 'sessions', '2025-10-10 06:48:51'),
(29, 'عرض جلسة', 'View Session', 'sessions', '2025-10-10 06:48:51'),
(30, 'تعديل جلسة', 'Edit Session', 'sessions', '2025-10-10 06:48:51'),
(31, 'حذف جلسة', 'Delete Session', 'sessions', '2025-10-10 06:48:51'),
(32, 'إضافة مذكرة', 'Add Memo', 'memos', '2025-10-10 06:48:51'),
(33, 'عرض مذكرة', 'View Memo', 'memos', '2025-10-10 06:48:51'),
(34, 'تعديل مذكرة', 'Edit Memo', 'memos', '2025-10-10 06:48:51'),
(35, 'حذف مذكرة', 'Delete Memo', 'memos', '2025-10-10 06:48:51'),
(36, 'إضافة أطراف القضية', 'Add Case Parties', 'case_parties', '2025-10-10 06:48:51'),
(37, 'عرض أطراف القضية', 'View Case Parties', 'case_parties', '2025-10-10 06:48:51'),
(38, 'تعديل أطراف القضية', 'Edit Case Parties', 'case_parties', '2025-10-10 06:48:51'),
(39, 'حذف أطراف القضية', 'Delete Case Parties', 'case_parties', '2025-10-10 06:48:51'),
(40, 'إضافة مهمة', 'Add Task', 'tasks', '2025-10-10 06:48:51'),
(41, 'عرض مهمة', 'View Task', 'tasks', '2025-10-10 06:48:51'),
(42, 'تعديل مهمة', 'Edit Task', 'tasks', '2025-10-10 06:48:51'),
(43, 'حذف مهمة', 'Delete Task', 'tasks', '2025-10-10 06:48:51'),
(44, 'إضافة مركز شرطة', 'Add Police Station', 'police_stations', '2025-10-10 06:48:51'),
(45, 'عرض مركز شرطة', 'View Police Station', 'police_stations', '2025-10-10 06:48:51'),
(46, 'تعديل مركز شرطة', 'Edit Police Station', 'police_stations', '2025-10-10 06:48:51'),
(47, 'حذف مركز شرطة', 'Delete Police Station', 'police_stations', '2025-10-10 06:48:51'),
(48, 'إضافة فريق القضية', 'Add Case Team', 'case_team', '2025-10-10 06:48:51'),
(49, 'عرض فريق القضية', 'View Case Team', 'case_team', '2025-10-10 06:48:51'),
(50, 'تعديل فريق القضية', 'Edit Case Team', 'case_team', '2025-10-10 06:48:51'),
(51, 'حذف فريق القضية', 'Delete Case Team', 'case_team', '2025-10-10 06:48:51'),
(52, 'إضافة مرحلة القضية', 'Add Case Stage', 'case_stages', '2025-10-10 06:48:51'),
(53, 'عرض مرحلة القضية', 'View Case Stage', 'case_stages', '2025-10-10 06:48:51'),
(54, 'تعديل مرحلة القضية', 'Edit Case Stage', 'case_stages', '2025-10-10 06:48:51'),
(55, 'حذف مرحلة القضية', 'Delete Case Stage', 'case_stages', '2025-10-10 06:48:51'),
(56, 'إضافة عريضة', 'Add Petition', 'petitions', '2025-10-10 06:48:51'),
(57, 'عرض عريضة', 'View Petition', 'petitions', '2025-10-10 06:48:51'),
(58, 'تعديل عريضة', 'Edit Petition', 'petitions', '2025-10-10 06:48:51'),
(59, 'حذف عريضة', 'Delete Petition', 'petitions', '2025-10-10 06:48:51'),
(60, 'إضافة تنفيذ', 'Add Execution', 'executions', '2025-10-10 06:48:51'),
(61, 'عرض تنفيذ', 'View Execution', 'executions', '2025-10-10 06:48:51'),
(62, 'تعديل تنفيذ', 'Edit Execution', 'executions', '2025-10-10 06:48:51'),
(63, 'حذف تنفيذ', 'Delete Execution', 'executions', '2025-10-10 06:48:51'),
(64, 'إضافة إشعار قضائي', 'Add Judicial Notice', 'judicial_notices', '2025-10-10 06:48:51'),
(65, 'عرض إشعار قضائي', 'View Judicial Notice', 'judicial_notices', '2025-10-10 06:48:51'),
(66, 'تعديل إشعار قضائي', 'Edit Judicial Notice', 'judicial_notices', '2025-10-10 06:48:51'),
(67, 'حذف إشعار قضائي', 'Delete Judicial Notice', 'judicial_notices', '2025-10-10 06:48:51'),
(68, 'إضافة عميل', 'Add Client', 'clients', '2025-10-10 06:48:51'),
(69, 'عرض عميل', 'View Client', 'clients', '2025-10-10 06:48:51'),
(70, 'تعديل عميل', 'Edit Client', 'clients', '2025-10-10 06:48:51'),
(71, 'حذف عميل', 'Delete Client', 'clients', '2025-10-10 06:48:51'),
(72, 'إضافة اجتماع', 'Add Meeting', 'meetings', '2025-10-10 06:48:51'),
(73, 'عرض اجتماع', 'View Meeting', 'meetings', '2025-10-10 06:48:51'),
(74, 'تعديل اجتماع', 'Edit Meeting', 'meetings', '2025-10-10 06:48:51'),
(75, 'حذف اجتماع', 'Delete Meeting', 'meetings', '2025-10-10 06:48:51'),
(76, 'إضافة طلب عميل', 'Add Client Request', 'client_requests', '2025-10-10 06:48:51'),
(77, 'عرض طلب عميل', 'View Client Request', 'client_requests', '2025-10-10 06:48:51'),
(78, 'تعديل طلب عميل', 'Edit Client Request', 'client_requests', '2025-10-10 06:48:51'),
(79, 'حذف طلب عميل', 'Delete Client Request', 'client_requests', '2025-10-10 06:48:51'),
(80, 'إضافة موظف', 'Add Employee', 'employees', '2025-10-10 06:48:51'),
(81, 'عرض موظف', 'View Employee', 'employees', '2025-10-10 06:48:51'),
(82, 'تعديل موظف', 'Edit Employee', 'employees', '2025-10-10 06:48:51'),
(83, 'حذف موظف', 'Delete Employee', 'employees', '2025-10-10 06:48:51'),
(87, 'إضافة فاتورة', 'Add Invoice', 'invoices', '2025-10-24 10:43:11'),
(88, 'عرض فاتورة', 'View Invoice', 'invoices', '2025-10-24 10:43:11'),
(89, 'تعديل فاتورة', 'Edit Invoice', 'invoices', '2025-10-24 10:43:11'),
(90, 'حذف فاتورة', 'Delete Invoice', 'invoices', '2025-10-24 10:43:11'),
(91, 'إضافة دفعة', 'Add Payment', 'payments', '2025-10-24 10:43:11'),
(92, 'عرض دفعة', 'View Payment', 'payments', '2025-10-24 10:43:11'),
(93, 'تعديل دفعة', 'Edit Payment', 'payments', '2025-10-24 10:43:11'),
(94, 'حذف دفعة', 'Delete Payment', 'payments', '2025-10-24 10:43:11'),
(95, 'إضافة مصروف', 'Add Expense', 'expenses', '2025-10-24 10:43:11'),
(96, 'عرض مصروف', 'View Expense', 'expenses', '2025-10-24 10:43:11'),
(97, 'تعديل مصروف', 'Edit Expense', 'expenses', '2025-10-24 10:43:11'),
(98, 'حذف مصروف', 'Delete Expense', 'expenses', '2025-10-24 10:43:11'),
(99, 'إضافة حساب بنكي', 'Add Bank Account', 'bank_accounts', '2025-10-24 10:43:11'),
(100, 'عرض حساب بنكي', 'View Bank Account', 'bank_accounts', '2025-10-24 10:43:11'),
(101, 'تعديل حساب بنكي', 'Edit Bank Account', 'bank_accounts', '2025-10-24 10:43:11'),
(102, 'حذف حساب بنكي', 'Delete Bank Account', 'bank_accounts', '2025-10-24 10:43:11'),
(103, 'عرض التقارير المالية', 'View Financial Reports', 'financial_reports', '2025-10-24 10:43:11'),
(104, 'عرض المحفظة', 'View Wallet', 'wallets', '2025-10-24 10:43:31'),
(105, 'تعديل المحفظة', 'Edit Wallet', 'wallets', '2025-10-24 10:43:31'),
(106, 'حذف المحفظة', 'Delete Wallet', 'wallets', '2025-10-24 10:43:31'),
(107, 'إضافة قضية', 'Add Case', 'cases', '2025-10-24 19:38:11'),
(108, 'عرض قضية', 'View Case', 'cases', '2025-10-24 19:38:11'),
(109, 'تعديل قضية', 'Edit Case', 'cases', '2025-10-24 19:38:11'),
(110, 'حذف قضية', 'Delete Case', 'cases', '2025-10-25 02:01:59');

-- --------------------------------------------------------

--
-- بنية الجدول `police_stations`
--

CREATE TABLE `police_stations` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `police_stations`
--

INSERT INTO `police_stations` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(1, 'مركز شرطة الراشدية', 'Al Rashidiya Police Station', '2025-09-18 06:18:47'),
(3, 'مركز شرطة الحميدية', 'Al Hamidiya Police Station', '2025-09-18 06:18:47'),
(4, 'مركز شرطة النعيمية', 'Al Nuaimiya Police Station', '2025-09-18 06:18:47'),
(25, 'شرظة مصفوت', 'شرطة الجرف', '2025-09-20 19:32:02');

-- --------------------------------------------------------

--
-- بنية الجدول `public_prosecutions`
--

CREATE TABLE `public_prosecutions` (
  `id` int NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `public_prosecutions`
--

INSERT INTO `public_prosecutions` (`id`, `name_ar`, `name_en`, `created_at`) VALUES
(1, 'نيابة دبي', 'Dubai Public Prosecution', '2025-09-18 06:18:47'),
(2, 'نيابة عحمان', 'Anti-Corruption Specialized Prosecution', '2025-09-18 06:18:47'),
(3, 'نيابة دبي', 'Dubai Public Prosecution', '2025-09-18 06:19:16');

-- --------------------------------------------------------

--
-- بنية الجدول `related_cases`
--

CREATE TABLE `related_cases` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `related_case_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `reviews`
--

CREATE TABLE `reviews` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `reviews`
--

INSERT INTO `reviews` (`id`, `employee_id`, `type`, `date`, `created_by`, `created_at`) VALUES
(2, 97, 'mid-year', '2025-10-15', 90, '2025-10-13 09:27:01'),
(3, 114, 'annual', '2025-10-20', 90, '2025-10-20 10:26:45');

-- --------------------------------------------------------

--
-- بنية الجدول `review_documents`
--

CREATE TABLE `review_documents` (
  `id` int NOT NULL,
  `review_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2055) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `review_documents`
--

INSERT INTO `review_documents` (`id`, `review_id`, `document_name`, `document_url`, `created_by`, `created_at`) VALUES
(3, 3, 'ArFederal DecreeLaw No 33 of 2021 Regarding the Regulation of Employment Relationship and its amendm.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/reviews/1760956004084-7rg86f27x9k.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251020%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251020T102644Z&X-Amz-Expires=604800&X-Amz-Signature=4eab2d6f2e67d716c3ff5aa07fe0912dd8dd1d1e37fa09457417846d1deff57d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 90, '2025-10-20 10:26:45');

-- --------------------------------------------------------

--
-- بنية الجدول `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_ar` varchar(100) NOT NULL,
  `role_en` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `roles`
--

INSERT INTO `roles` (`id`, `role_ar`, `role_en`, `created_at`) VALUES
(1, 'مدير عام', 'admin', '2025-09-18 06:12:44'),
(2, 'مدير قانوني', 'Legal Manager', '2025-09-18 06:12:44'),
(3, 'محامي', 'Lawyer', '2025-09-18 06:12:44'),
(4, 'مستشار قانوني', 'Legal Advisor', '2025-09-18 06:12:44'),
(5, 'باحث قانوني', 'Legal Researcher', '2025-09-18 06:12:44'),
(6, 'سكرتير', 'Secretary', '2025-09-18 06:12:44'),
(7, 'محاسب', 'Accountant', '2025-09-18 06:12:44'),
(8, 'موظف استقبال', 'Receptionist', '2025-09-18 06:12:44'),
(9, 'مطور', 'developer', '2025-09-18 16:03:18'),
(10, 'موظف موارد بشرية', 'HR Officer', '2025-10-13 01:59:33');

-- --------------------------------------------------------

--
-- بنية الجدول `salaries`
--

CREATE TABLE `salaries` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `base_salary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT '0.00',
  `deductions` decimal(10,2) DEFAULT '0.00',
  `overtime_hours` decimal(5,2) DEFAULT '0.00',
  `overtime_rate` decimal(10,2) DEFAULT '0.00',
  `overtime_amount` decimal(10,2) DEFAULT '0.00',
  `net_salary` decimal(10,2) NOT NULL,
  `pay_period` date NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('pending','processed','paid') DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `sessions`
--

CREATE TABLE `sessions` (
  `id` int NOT NULL,
  `case_id` int NOT NULL,
  `session_date` datetime NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_expert_session` tinyint(1) DEFAULT '0',
  `decision` varchar(255) DEFAULT NULL,
  `note` text,
  `is_judgment_reserved` tinyint(1) NOT NULL DEFAULT '0',
  `is_judgment_deferred` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `sessions`
--

INSERT INTO `sessions` (`id`, `case_id`, `session_date`, `link`, `is_expert_session`, `decision`, `note`, `is_judgment_reserved`, `is_judgment_deferred`, `status`, `created_at`) VALUES
(69, 143, '2025-10-28 20:00:00', NULL, 1, 'تقديم مذكرة جوابيه', NULL, 1, 0, 'active', '2025-10-15 15:49:20'),
(70, 144, '2025-10-21 08:00:00', '', 0, 'اول جلسة ', NULL, 0, 0, 'active', '2025-10-17 06:36:59'),
(71, 139, '2025-10-15 20:36:00', 'https://lexra-law-management-v2-246023670849.us-west1.run.app/#/case-files/add', 1, 'test', 'test', 0, 0, 'active', '2025-10-19 12:34:42');

-- --------------------------------------------------------

--
-- بنية الجدول `session_documents`
--

CREATE TABLE `session_documents` (
  `id` int NOT NULL,
  `document_url` varchar(1055) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `session_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `sick_leaves`
--

CREATE TABLE `sick_leaves` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `total_days` int NOT NULL,
  `remaining_days` int DEFAULT '0',
  `leave_type` enum('paid','unpaid') NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `sick_leaves`
--

INSERT INTO `sick_leaves` (`id`, `employee_id`, `date`, `from_date`, `to_date`, `total_days`, `remaining_days`, `leave_type`, `created_by`, `created_at`) VALUES
(1, 90, '2025-10-08', '2025-10-08', '2025-10-09', 2, 2, 'unpaid', 73, '2025-10-12 04:59:54'),
(2, 114, '2025-10-20', '2025-10-20', '2025-10-20', 1, 29, 'paid', 90, '2025-10-20 10:47:04');

-- --------------------------------------------------------

--
-- بنية الجدول `tasks`
--

CREATE TABLE `tasks` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `assigned_to` int DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `case_id` int DEFAULT NULL,
  `priority` enum('normal','high','urgent') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'normal',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `due_date` date DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `assigned_to`, `assigned_by`, `case_id`, `priority`, `status`, `due_date`, `completed_at`, `created_at`) VALUES
(40, 'عمل مذكرة  وارسالها خلال هذا الاسبوع', 'يرجى ارسال المذكرة مع إرفاق الملفات والمستندات المتعلقة بها', 90, 73, 139, 'high', 'completed', '2025-10-13', NULL, '2025-10-05 15:27:09'),
(44, 'مذكرة جوابيه ', 'مذكرة جوابيه ', 102, 105, 143, 'urgent', 'in_progress', '2025-10-31', NULL, '2025-10-15 15:49:20'),
(45, 'مذكرة جوابيه ', 'مذكرة جوابيه ', 108, 105, 143, 'normal', 'pending', '2025-10-31', NULL, '2025-10-15 15:58:13'),
(46, 'مذكرة جوابيه', 'مذكرة جوابيه', 108, 108, 143, 'high', 'pending', '2025-10-28', NULL, '2025-10-15 16:02:35'),
(47, 'كتابه مذكرة ', 'كتابه مذكرة ', 102, 105, 144, 'urgent', 'pending', '2025-10-21', NULL, '2025-10-17 06:36:59');

-- --------------------------------------------------------

--
-- بنية الجدول `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `comment` varchar(255) NOT NULL,
  `commented_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `task_comments`
--

INSERT INTO `task_comments` (`id`, `task_id`, `comment`, `commented_by`, `created_at`) VALUES
(7, 40, 'تم عمل المذكرة اليوم', 90, '2025-10-05 22:41:01');

-- --------------------------------------------------------

--
-- بنية الجدول `task_documents`
--

CREATE TABLE `task_documents` (
  `id` int NOT NULL,
  `task_id` int NOT NULL,
  `document_url` varchar(1055) NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `trainings`
--

CREATE TABLE `trainings` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `training_date` date NOT NULL,
  `type` varchar(100) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `trainings`
--

INSERT INTO `trainings` (`id`, `employee_id`, `training_date`, `type`, `created_by`, `created_at`) VALUES
(2, 96, '2025-10-14', 'test', 73, '2025-10-12 07:18:51'),
(3, 97, '2025-10-23', 'تديب محاماة', 90, '2025-10-13 09:27:57'),
(4, 114, '2025-10-21', 'Vat Training ', 90, '2025-10-20 10:27:11');

-- --------------------------------------------------------

--
-- بنية الجدول `training_documents`
--

CREATE TABLE `training_documents` (
  `id` int NOT NULL,
  `training_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `wallets`
--

CREATE TABLE `wallets` (
  `id` int NOT NULL,
  `client_id` int NOT NULL,
  `balance` decimal(20,4) NOT NULL DEFAULT '0.0000',
  `currency` varchar(3) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'AED',
  `status` enum('active','suspended','closed') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `wallets`
--

INSERT INTO `wallets` (`id`, `client_id`, `balance`, `currency`, `status`, `created_at`, `created_by`, `updated_by`) VALUES
(2, 30, '53446.0000', 'AED', 'active', '2025-10-20 14:12:41', 90, 90),
(3, 32, '4325.0000', 'AED', 'active', '2025-10-20 14:32:16', 90, 90),
(4, 20, '0.0000', 'AED', 'active', '2025-10-20 15:11:01', 90, NULL),
(8, 52, '3321.4175', 'AED', 'active', '2025-10-24 02:54:18', 90, 90),
(9, 57, '0.0000', 'AED', 'active', '2025-10-24 08:25:07', 90, NULL),
(10, 53, '90000.0000', 'AED', 'active', '2025-10-24 08:25:53', 90, 90),
(11, 57, '0.0000', 'AED', 'active', '2025-10-24 20:32:24', 90, NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `wallet_deposits`
--

CREATE TABLE `wallet_deposits` (
  `id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `case_id` int DEFAULT NULL,
  `client_id` int NOT NULL,
  `bank_account_id` int DEFAULT NULL,
  `amount` decimal(20,4) NOT NULL,
  `method` enum('cash','bank_transfer','card','cheque','other') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'cash',
  `cheque_number` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference_no` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `note` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- إرجاع أو استيراد بيانات الجدول `wallet_deposits`
--

INSERT INTO `wallet_deposits` (`id`, `wallet_id`, `case_id`, `client_id`, `bank_account_id`, `amount`, `method`, `cheque_number`, `reference_no`, `note`, `created_at`, `created_by`) VALUES
(1, 2, NULL, 30, NULL, '50000.0000', 'cash', NULL, NULL, NULL, '2025-10-20 14:13:33', 90),
(2, 2, NULL, 30, NULL, '1246.0000', 'cash', NULL, NULL, NULL, '2025-10-20 14:23:21', 90),
(4, 2, NULL, 30, 2, '2000.0000', 'cash', NULL, '54321', 'test', '2025-10-20 14:30:43', 90),
(5, 2, NULL, 30, 2, '200.0000', 'cash', NULL, NULL, NULL, '2025-10-20 14:31:13', 90),
(6, 3, NULL, 32, 2, '123.0000', 'cash', NULL, NULL, NULL, '2025-10-20 14:42:59', 90),
(7, 3, NULL, 32, 2, '4000.0000', 'cash', NULL, NULL, NULL, '2025-10-20 14:59:40', 90),
(8, 3, NULL, 32, NULL, '202.0000', 'bank_transfer', NULL, NULL, NULL, '2025-10-20 15:00:03', 90),
(13, 8, 142, 52, 1, '5000.0000', 'cash', NULL, NULL, NULL, '2025-10-24 02:54:47', 90),
(14, 10, 144, 53, 2, '90000.0000', 'cash', NULL, NULL, NULL, '2025-10-24 08:26:09', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `wallet_expenses`
--

CREATE TABLE `wallet_expenses` (
  `id` int NOT NULL COMMENT 'المعرف الفريد للمصروف',
  `wallet_id` int NOT NULL COMMENT 'رقم المحفظة (من wallets)',
  `client_id` int DEFAULT NULL COMMENT 'رقم العميل (من parties)',
  `bank_account_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL COMMENT 'المبلغ المصروف',
  `case_id` int DEFAULT NULL COMMENT 'رقم القضية (من cases)',
  `invoice_number` varchar(100) DEFAULT NULL COMMENT 'رقم الفاتورة',
  `invoice_date` date DEFAULT NULL COMMENT 'تاريخ الفاتورة',
  `employee_relat_id` int DEFAULT NULL COMMENT 'رقم الموظف المرتبط (من employees)',
  `created_by` int DEFAULT NULL COMMENT 'أنشئ بواسطة (من employees)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإنشاء',
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verified_by` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `rejection_reason` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `wallet_expenses`
--

INSERT INTO `wallet_expenses` (`id`, `wallet_id`, `client_id`, `bank_account_id`, `amount`, `case_id`, `invoice_number`, `invoice_date`, `employee_relat_id`, `created_by`, `created_at`, `status`, `verified_by`, `verified_at`, `rejection_reason`) VALUES
(8, 8, 52, 2, '1575.00', 142, 'INV-2025-000001', '2025-10-08', 95, 90, '2025-10-24 06:55:34', 'verified', 90, '2025-10-24 07:13:45', NULL),
(9, 8, 52, 1, '22.05', 142, 'INV-2025-000009', '2025-10-07', 96, 90, '2025-10-24 11:11:52', 'pending', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `wallet_expenses_items`
--

CREATE TABLE `wallet_expenses_items` (
  `id` int NOT NULL COMMENT 'المعرف الفريد لبند المصروف',
  `wallet_expense_id` int NOT NULL COMMENT 'رقم المصروف الرئيسي (من wallet_expenses)',
  `description` varchar(255) NOT NULL COMMENT 'وصف البند',
  `amount` decimal(10,2) NOT NULL COMMENT 'المبلغ الخاص بالبند',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'تاريخ الإضافة'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `wallet_expenses_items`
--

INSERT INTO `wallet_expenses_items` (`id`, `wallet_expense_id`, `description`, `amount`, `created_at`) VALUES
(8, 8, 'test', '1500.00', '2025-10-24 06:55:34'),
(9, 9, 'test', '21.00', '2025-10-24 11:11:52');

-- --------------------------------------------------------

--
-- بنية الجدول `wallet_expense_receipts`
--

CREATE TABLE `wallet_expense_receipts` (
  `id` int NOT NULL,
  `wallet_expense_id` int NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `wallet_expense_receipts`
--

INSERT INTO `wallet_expense_receipts` (`id`, `wallet_expense_id`, `file_name`, `file_path`, `uploaded_by`, `uploaded_at`) VALUES
(1, 8, 'IMG_9457.jpg', 'wallet-expense-receipts/1761275610702-0hbjfixo2jh.jpg', 90, '2025-10-24 07:13:33');

-- --------------------------------------------------------

--
-- بنية الجدول `warnings`
--

CREATE TABLE `warnings` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `type` enum('verbal','written') NOT NULL,
  `reason` varchar(255) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `warnings`
--

INSERT INTO `warnings` (`id`, `employee_id`, `date`, `type`, `reason`, `created_by`, `created_at`) VALUES
(2, 97, '2025-10-15', 'verbal', 'اهمال', 90, '2025-10-13 09:28:28'),
(3, 114, '2025-10-21', 'written', 'non compliance to office policies ', 90, '2025-10-20 10:27:41');

-- --------------------------------------------------------

--
-- بنية الجدول `warning_documents`
--

CREATE TABLE `warning_documents` (
  `id` int NOT NULL,
  `warning_id` int NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- بنية الجدول `work_hours`
--

CREATE TABLE `work_hours` (
  `id` int NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `work_hours`
--

INSERT INTO `work_hours` (`id`, `start_time`, `end_time`, `created_at`) VALUES
(1, '08:00:00', '17:00:00', '2025-10-12 02:53:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `annual_leaves`
--
ALTER TABLE `annual_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `app_notifications`
--
ALTER TABLE `app_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recipient_id` (`recipient_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `asset_documents`
--
ALTER TABLE `asset_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asset_id` (`asset_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bank_branch` (`branch_id`),
  ADD KEY `fk_bank_created_by` (`created_by`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `call_logs`
--
ALTER TABLE `call_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_call_created_by` (`created_by`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `file_number` (`file_number`),
  ADD KEY `idx_cases_file_number` (`file_number`),
  ADD KEY `idx_cases_branch_id` (`branch_id`),
  ADD KEY `idx_cases_lawyer_id` (`lawyer_id`),
  ADD KEY `idx_cases_created_at` (`created_at`),
  ADD KEY `cases_ibfk_12` (`counterclaim_id`),
  ADD KEY `cases_ibfk_13` (`court_id`),
  ADD KEY `cases_ibfk_14` (`counter_case_id`),
  ADD KEY `cases_ibfk_2` (`police_station_id`),
  ADD KEY `cases_ibfk_3` (`public_prosecution_id`),
  ADD KEY `cases_ibfk_5` (`secretary_id`),
  ADD KEY `cases_ibfk_6` (`case_classification_id`),
  ADD KEY `cases_ibfk_7` (`case_type_id`),
  ADD KEY `cases_ibfk_8` (`legal_advisor_id`),
  ADD KEY `cases_ibfk_9` (`legal_researcher_id`);

--
-- Indexes for table `case_classifications`
--
ALTER TABLE `case_classifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `case_degrees`
--
ALTER TABLE `case_degrees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `case_documents`
--
ALTER TABLE `case_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_case_documents_case_id` (`case_id`);

--
-- Indexes for table `case_employees_documents`
--
ALTER TABLE `case_employees_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `case_employees_documents_ibfk_2` (`employee_id`);

--
-- Indexes for table `case_parties`
--
ALTER TABLE `case_parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `case_parties_ibfk_3` (`party_id`),
  ADD KEY `case_parties_ibfk_1` (`case_id`);

--
-- Indexes for table `case_parties_documents`
--
ALTER TABLE `case_parties_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `case_parties_document_ibfk_2` (`uploaded_by`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `case_petitions`
--
ALTER TABLE `case_petitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `case_petition_documents`
--
ALTER TABLE `case_petition_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `petition_id` (`petition_id`);

--
-- Indexes for table `case_relations`
--
ALTER TABLE `case_relations`
  ADD UNIQUE KEY `related_case_id` (`related_case_id`),
  ADD KEY `case_relations_ibfk_1` (`case_id`);

--
-- Indexes for table `case_types`
--
ALTER TABLE `case_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients_deals`
--
ALTER TABLE `clients_deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `courts`
--
ALTER TABLE `courts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `court_case_documents`
--
ALTER TABLE `court_case_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_court_documents_case_id` (`case_id`),
  ADD KEY `court_case_documents_ibfk_2` (`uploaded_by`);

--
-- Indexes for table `deal_documents`
--
ALTER TABLE `deal_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_id` (`deal_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `deductions`
--
ALTER TABLE `deductions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposits`
--
ALTER TABLE `deposits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bank_account_id` (`bank_account_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_id` (`job_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `directManagerId` (`direct_manager_id`),
  ADD KEY `idx_employees_department` (`department_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `employees_ibfk_4` (`branch_id`);

--
-- Indexes for table `employee_attendance`
--
ALTER TABLE `employee_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `employee_attendance_ibfk_2` (`created_by`);

--
-- Indexes for table `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_uploaded_at` (`created_at`);

--
-- Indexes for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_permissions_ibfk_1` (`permission_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `employee_requests`
--
ALTER TABLE `employee_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `executions`
--
ALTER TABLE `executions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `executions_documents`
--
ALTER TABLE `executions_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `executions_documnts_ibfk_1` (`execution_id`),
  ADD KEY `executions_documnts_ibfk_2` (`uploaded_by`);

--
-- Indexes for table `external_links`
--
ALTER TABLE `external_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `forms`
--
ALTER TABLE `forms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `goaml`
--
ALTER TABLE `goaml`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_goaml_created_by` (`created_by`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `referred_by_employee_id` (`referred_by_employee_id`),
  ADD KEY `bank_account_id` (`bank_account_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `judicial_orders`
--
ALTER TABLE `judicial_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `judicial_orders_documents`
--
ALTER TABLE `judicial_orders_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `judicial_orders_id` (`judicial_order_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `litigation_degrees`
--
ALTER TABLE `litigation_degrees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_meetings_employee` (`created_by`),
  ADD KEY `lawyer_id` (`lawyer_id`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `meetings_documents`
--
ALTER TABLE `meetings_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `meeting_id` (`meeting_id`);

--
-- Indexes for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `meeting_id` (`meeting_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `memos`
--
ALTER TABLE `memos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `memo_documents`
--
ALTER TABLE `memo_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `memo_id` (`memo_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `other_leaves`
--
ALTER TABLE `other_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `parties`
--
ALTER TABLE `parties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `branch_id` (`branch_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `parties_documents`
--
ALTER TABLE `parties_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `idx_parties_documents_party_id` (`party_id`);

--
-- Indexes for table `parties_orders`
--
ALTER TABLE `parties_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `party_id` (`party_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_permission` (`permission_ar`,`permission_en`);

--
-- Indexes for table `police_stations`
--
ALTER TABLE `police_stations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `public_prosecutions`
--
ALTER TABLE `public_prosecutions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `related_cases`
--
ALTER TABLE `related_cases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `case_id` (`case_id`),
  ADD KEY `related_case_id` (`related_case_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `review_documents`
--
ALTER TABLE `review_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `review_documents_ibfk_1` (`review_id`),
  ADD KEY `review_documents_ibfk_2` (`created_by`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_ar` (`role_ar`),
  ADD UNIQUE KEY `unique_role_en` (`role_en`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sessions_case_id` (`case_id`),
  ADD KEY `idx_sessions_date` (`session_date`);

--
-- Indexes for table `session_documents`
--
ALTER TABLE `session_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `session_documents_ibfk_1` (`session_id`);

--
-- Indexes for table `sick_leaves`
--
ALTER TABLE `sick_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_tasks_assigned_to` (`assigned_to`),
  ADD KEY `idx_tasks_case_id` (`case_id`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_due_date` (`due_date`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_comments_ibfk_1` (`task_id`),
  ADD KEY `employee_id` (`commented_by`);

--
-- Indexes for table `task_documents`
--
ALTER TABLE `task_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uploaded_by` (`uploaded_by`),
  ADD KEY `task_documents_ibfk_1` (`task_id`);

--
-- Indexes for table `trainings`
--
ALTER TABLE `trainings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainings_ibfk_1` (`employee_id`),
  ADD KEY `trainings_ibfk_2` (`created_by`);

--
-- Indexes for table `training_documents`
--
ALTER TABLE `training_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_documents_ibfk_1` (`training_id`),
  ADD KEY `training_documents_ibfk_2` (`created_by`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wallets_client_id` (`client_id`),
  ADD KEY `idx_wallets_status` (`status`),
  ADD KEY `fk_wallets_created_by` (`created_by`),
  ADD KEY `fk_wallets_updated_by` (`updated_by`);

--
-- Indexes for table `wallet_deposits`
--
ALTER TABLE `wallet_deposits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wallet_deposits_wallet_id` (`wallet_id`),
  ADD KEY `idx_wallet_deposits_client_id` (`client_id`),
  ADD KEY `idx_wallet_deposits_created_by` (`created_by`),
  ADD KEY `idx_wallet_deposits_bank_account_id` (`bank_account_id`),
  ADD KEY `case_id` (`case_id`);

--
-- Indexes for table `wallet_expenses`
--
ALTER TABLE `wallet_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wallet` (`wallet_id`),
  ADD KEY `fks_client` (`client_id`),
  ADD KEY `fkwallet_case` (`case_id`),
  ADD KEY `fk_employee_relat` (`employee_relat_id`),
  ADD KEY `fkwallet_created_by` (`created_by`),
  ADD KEY `bank_account_id` (`bank_account_id`);

--
-- Indexes for table `wallet_expenses_items`
--
ALTER TABLE `wallet_expenses_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_wallet_expense` (`wallet_expense_id`);

--
-- Indexes for table `wallet_expense_receipts`
--
ALTER TABLE `wallet_expense_receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_expense_id` (`wallet_expense_id`),
  ADD KEY `uploaded_by` (`uploaded_by`);

--
-- Indexes for table `warnings`
--
ALTER TABLE `warnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `warning_documents`
--
ALTER TABLE `warning_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `warning_documents_ibfk_1` (`warning_id`),
  ADD KEY `warning_documents_ibfk_2` (`created_by`);

--
-- Indexes for table `work_hours`
--
ALTER TABLE `work_hours`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `annual_leaves`
--
ALTER TABLE `annual_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `app_notifications`
--
ALTER TABLE `app_notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `asset_documents`
--
ALTER TABLE `asset_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `call_logs`
--
ALTER TABLE `call_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT for table `case_classifications`
--
ALTER TABLE `case_classifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `case_degrees`
--
ALTER TABLE `case_degrees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `case_documents`
--
ALTER TABLE `case_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `case_employees_documents`
--
ALTER TABLE `case_employees_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `case_parties`
--
ALTER TABLE `case_parties`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `case_parties_documents`
--
ALTER TABLE `case_parties_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `case_petitions`
--
ALTER TABLE `case_petitions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `case_petition_documents`
--
ALTER TABLE `case_petition_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `case_types`
--
ALTER TABLE `case_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `clients_deals`
--
ALTER TABLE `clients_deals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `courts`
--
ALTER TABLE `courts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `court_case_documents`
--
ALTER TABLE `court_case_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `deal_documents`
--
ALTER TABLE `deal_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `deductions`
--
ALTER TABLE `deductions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `deposits`
--
ALTER TABLE `deposits`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `employee_attendance`
--
ALTER TABLE `employee_attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=916;

--
-- AUTO_INCREMENT for table `employee_requests`
--
ALTER TABLE `employee_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `event_attendance`
--
ALTER TABLE `event_attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `executions`
--
ALTER TABLE `executions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `executions_documents`
--
ALTER TABLE `executions_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `external_links`
--
ALTER TABLE `external_links`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `goaml`
--
ALTER TABLE `goaml`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `judicial_orders`
--
ALTER TABLE `judicial_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `judicial_orders_documents`
--
ALTER TABLE `judicial_orders_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `litigation_degrees`
--
ALTER TABLE `litigation_degrees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `meetings_documents`
--
ALTER TABLE `meetings_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  MODIFY `attendance_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `memos`
--
ALTER TABLE `memos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `memo_documents`
--
ALTER TABLE `memo_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `other_leaves`
--
ALTER TABLE `other_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `parties`
--
ALTER TABLE `parties`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT for table `parties_documents`
--
ALTER TABLE `parties_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `parties_orders`
--
ALTER TABLE `parties_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `police_stations`
--
ALTER TABLE `police_stations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `public_prosecutions`
--
ALTER TABLE `public_prosecutions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `related_cases`
--
ALTER TABLE `related_cases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `review_documents`
--
ALTER TABLE `review_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `session_documents`
--
ALTER TABLE `session_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `sick_leaves`
--
ALTER TABLE `sick_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `task_documents`
--
ALTER TABLE `task_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `training_documents`
--
ALTER TABLE `training_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `wallet_deposits`
--
ALTER TABLE `wallet_deposits`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `wallet_expenses`
--
ALTER TABLE `wallet_expenses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'المعرف الفريد للمصروف', AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wallet_expenses_items`
--
ALTER TABLE `wallet_expenses_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'المعرف الفريد لبند المصروف', AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wallet_expense_receipts`
--
ALTER TABLE `wallet_expense_receipts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `warnings`
--
ALTER TABLE `warnings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warning_documents`
--
ALTER TABLE `warning_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `work_hours`
--
ALTER TABLE `work_hours`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- قيود الجداول المحفوظة
--

--
-- القيود للجدول `annual_leaves`
--
ALTER TABLE `annual_leaves`
  ADD CONSTRAINT `annual_leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `annual_leaves_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `app_notifications`
--
ALTER TABLE `app_notifications`
  ADD CONSTRAINT `app_notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `app_notifications_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `asset_documents`
--
ALTER TABLE `asset_documents`
  ADD CONSTRAINT `asset_documents_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`),
  ADD CONSTRAINT `asset_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `fk_bank_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  ADD CONSTRAINT `fk_bank_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `call_logs`
--
ALTER TABLE `call_logs`
  ADD CONSTRAINT `fk_call_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `cases`
--
ALTER TABLE `cases`
  ADD CONSTRAINT `cases_ibfk_11` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `cases_ibfk_12` FOREIGN KEY (`counterclaim_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_13` FOREIGN KEY (`court_id`) REFERENCES `courts` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_14` FOREIGN KEY (`counter_case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_2` FOREIGN KEY (`police_station_id`) REFERENCES `police_stations` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_3` FOREIGN KEY (`public_prosecution_id`) REFERENCES `public_prosecutions` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_4` FOREIGN KEY (`lawyer_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_5` FOREIGN KEY (`secretary_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_6` FOREIGN KEY (`case_classification_id`) REFERENCES `case_classifications` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_7` FOREIGN KEY (`case_type_id`) REFERENCES `case_types` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_8` FOREIGN KEY (`legal_advisor_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `cases_ibfk_9` FOREIGN KEY (`legal_researcher_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `case_degrees`
--
ALTER TABLE `case_degrees`
  ADD CONSTRAINT `case_degrees_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- القيود للجدول `case_documents`
--
ALTER TABLE `case_documents`
  ADD CONSTRAINT `case_documents_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `case_employees_documents`
--
ALTER TABLE `case_employees_documents`
  ADD CONSTRAINT `case_employees_documents_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `case_employees_documents_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `case_parties`
--
ALTER TABLE `case_parties`
  ADD CONSTRAINT `case_parties_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `case_parties_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  ADD CONSTRAINT `case_parties_ibfk_3` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- القيود للجدول `case_parties_documents`
--
ALTER TABLE `case_parties_documents`
  ADD CONSTRAINT `case_parties_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `case_parties_documents_ibfk_3` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `case_parties_documents_ibfk_4` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `case_petitions`
--
ALTER TABLE `case_petitions`
  ADD CONSTRAINT `case_petitions_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- القيود للجدول `case_petition_documents`
--
ALTER TABLE `case_petition_documents`
  ADD CONSTRAINT `case_petition_documents_ibfk_1` FOREIGN KEY (`petition_id`) REFERENCES `case_petitions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- القيود للجدول `case_relations`
--
ALTER TABLE `case_relations`
  ADD CONSTRAINT `case_relations_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `case_relations_ibfk_2` FOREIGN KEY (`related_case_id`) REFERENCES `cases` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- القيود للجدول `clients_deals`
--
ALTER TABLE `clients_deals`
  ADD CONSTRAINT `fk_client` FOREIGN KEY (`client_id`) REFERENCES `parties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `court_case_documents`
--
ALTER TABLE `court_case_documents`
  ADD CONSTRAINT `court_case_documents_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `court_case_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `deal_documents`
--
ALTER TABLE `deal_documents`
  ADD CONSTRAINT `deal_documents_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `clients_deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deal_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `deductions`
--
ALTER TABLE `deductions`
  ADD CONSTRAINT `deductions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `deductions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `deposits`
--
ALTER TABLE `deposits`
  ADD CONSTRAINT `deposits_ibfk_1` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deposits_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`direct_manager_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  ADD CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `employee_attendance`
--
ALTER TABLE `employee_attendance`
  ADD CONSTRAINT `employee_attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_attendance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `employee_documents`
--
ALTER TABLE `employee_documents`
  ADD CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `employee_permissions`
--
ALTER TABLE `employee_permissions`
  ADD CONSTRAINT `employee_permissions_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_permissions_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- القيود للجدول `employee_requests`
--
ALTER TABLE `employee_requests`
  ADD CONSTRAINT `employee_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `employee_requests_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `event_attendance`
--
ALTER TABLE `event_attendance`
  ADD CONSTRAINT `event_attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`),
  ADD CONSTRAINT `event_attendance_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `executions`
--
ALTER TABLE `executions`
  ADD CONSTRAINT `executions_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `executions_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `executions_documents`
--
ALTER TABLE `executions_documents`
  ADD CONSTRAINT `executions_documents_ibfk_1` FOREIGN KEY (`execution_id`) REFERENCES `executions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `executions_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `external_links`
--
ALTER TABLE `external_links`
  ADD CONSTRAINT `external_links_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `goaml`
--
ALTER TABLE `goaml`
  ADD CONSTRAINT `fk_goaml_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`referred_by_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `judicial_orders`
--
ALTER TABLE `judicial_orders`
  ADD CONSTRAINT `judicial_orders_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `judicial_orders_documents`
--
ALTER TABLE `judicial_orders_documents`
  ADD CONSTRAINT `judicial_orders_documents_ibfk_1` FOREIGN KEY (`judicial_order_id`) REFERENCES `judicial_orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `judicial_orders_documents_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `leaves`
--
ALTER TABLE `leaves`
  ADD CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `fk_meetings_employee` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`lawyer_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- القيود للجدول `meetings_documents`
--
ALTER TABLE `meetings_documents`
  ADD CONSTRAINT `meetings_documents_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `meetings_documents_ibfk_2` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- القيود للجدول `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  ADD CONSTRAINT `meeting_attendance_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`),
  ADD CONSTRAINT `meeting_attendance_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `memos`
--
ALTER TABLE `memos`
  ADD CONSTRAINT `memos_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `memos_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- القيود للجدول `memo_documents`
--
ALTER TABLE `memo_documents`
  ADD CONSTRAINT `memo_documents_ibfk_1` FOREIGN KEY (`memo_id`) REFERENCES `memos` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `memo_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `other_leaves`
--
ALTER TABLE `other_leaves`
  ADD CONSTRAINT `other_leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `other_leaves_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `parties`
--
ALTER TABLE `parties`
  ADD CONSTRAINT `parties_ibfk_1` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `parties_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `parties_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `parties_documents`
--
ALTER TABLE `parties_documents`
  ADD CONSTRAINT `parties_documents_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `parties_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `parties_orders`
--
ALTER TABLE `parties_orders`
  ADD CONSTRAINT `parties_orders_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `parties_orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- القيود للجدول `related_cases`
--
ALTER TABLE `related_cases`
  ADD CONSTRAINT `related_cases_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `related_cases_ibfk_2` FOREIGN KEY (`related_case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- القيود للجدول `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `review_documents`
--
ALTER TABLE `review_documents`
  ADD CONSTRAINT `review_documents_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `review_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `salaries`
--
ALTER TABLE `salaries`
  ADD CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `session_documents`
--
ALTER TABLE `session_documents`
  ADD CONSTRAINT `session_documents_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `session_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- القيود للجدول `sick_leaves`
--
ALTER TABLE `sick_leaves`
  ADD CONSTRAINT `sick_leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `sick_leaves_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `task_comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `task_comments_ibfk_2` FOREIGN KEY (`commented_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

--
-- القيود للجدول `task_documents`
--
ALTER TABLE `task_documents`
  ADD CONSTRAINT `task_documents_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `task_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- القيود للجدول `trainings`
--
ALTER TABLE `trainings`
  ADD CONSTRAINT `trainings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trainings_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `training_documents`
--
ALTER TABLE `training_documents`
  ADD CONSTRAINT `training_documents_ibfk_1` FOREIGN KEY (`training_id`) REFERENCES `trainings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `training_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `fk_wallets_client` FOREIGN KEY (`client_id`) REFERENCES `parties` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wallets_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wallets_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `wallet_deposits`
--
ALTER TABLE `wallet_deposits`
  ADD CONSTRAINT `fk_wallet_deposits_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wallet_deposits_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallet_deposits_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `wallet_expenses`
--
ALTER TABLE `wallet_expenses`
  ADD CONSTRAINT `fk_employee_relat` FOREIGN KEY (`employee_relat_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `fk_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`),
  ADD CONSTRAINT `fks_client` FOREIGN KEY (`client_id`) REFERENCES `parties` (`id`),
  ADD CONSTRAINT `fkwallet_case` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`),
  ADD CONSTRAINT `fkwallet_created_by` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `wallet_expenses_ibfk_1` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- القيود للجدول `wallet_expenses_items`
--
ALTER TABLE `wallet_expenses_items`
  ADD CONSTRAINT `fk_wallet_expense` FOREIGN KEY (`wallet_expense_id`) REFERENCES `wallet_expenses` (`id`) ON DELETE CASCADE;

--
-- القيود للجدول `wallet_expense_receipts`
--
ALTER TABLE `wallet_expense_receipts`
  ADD CONSTRAINT `wallet_expense_receipts_ibfk_1` FOREIGN KEY (`wallet_expense_id`) REFERENCES `wallet_expenses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wallet_expense_receipts_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `warnings`
--
ALTER TABLE `warnings`
  ADD CONSTRAINT `warnings_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `warnings_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`);

--
-- القيود للجدول `warning_documents`
--
ALTER TABLE `warning_documents`
  ADD CONSTRAINT `warning_documents_ibfk_1` FOREIGN KEY (`warning_id`) REFERENCES `warnings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `warning_documents_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
