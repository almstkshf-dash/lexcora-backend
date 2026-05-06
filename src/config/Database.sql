-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: lexcora.c1yc80s4ipxt.us-east-2.rds.amazonaws.com
-- Generation Time: 06 نوفمبر 2025 الساعة 09:08
-- إصدار الخادم: 8.0.42
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lexcora`
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

-- --------------------------------------------------------

--
-- بنية الجدول `appeals_cassations`
--

CREATE TABLE `appeals_cassations` (
  `id` int NOT NULL,
  `session_id` int NOT NULL,
  `legal_period_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `category` varchar(100) DEFAULT NULL,
  `serial_number` varchar(150) DEFAULT NULL,
  `physical_location` varchar(255) DEFAULT NULL,
  `custodian_id` int DEFAULT NULL,
  `budget_id` int DEFAULT NULL,
  `purchase_cost` decimal(15,2) DEFAULT '0.00',
  `purchase_date` date DEFAULT NULL,
  `account_id` int DEFAULT NULL,
  `depreciation_rate` decimal(5,2) DEFAULT '0.00',
  `salvage_value` decimal(15,2) DEFAULT '0.00',
  `current_value` decimal(15,2) DEFAULT '0.00',
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
(1, 'ADIB', 'بنك أبوظبي الإسلامي', '14727007', '14727007', 2, '13099.15', 'active', NULL, '2025-10-16 10:44:47'),
(2, 'ENBD', 'بنك الإمارات دبي الوطني', '1014889400501', '1014889400501', 3, '169512.66', 'active', NULL, '2025-10-16 10:46:30');

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
(3, 'فرع عجمان', 'Ajman Branch', 'عجمان - الجرف - شارع الشيخ زايد', '2025-09-18 06:14:33'),
(6, 'الشارقة', 'Sharjah', 'المجاز', '2025-10-29 23:22:36');

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
  `is_pending` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `cases`
--

INSERT INTO `cases` (`id`, `file_number`, `case_number`, `police_station_id`, `public_prosecution_id`, `court_id`, `lawyer_id`, `secretary_id`, `case_classification_id`, `counter_case_id`, `case_type_id`, `legal_advisor_id`, `legal_researcher_id`, `fees`, `counterclaim_id`, `start_date`, `additional_note`, `topic`, `branch_id`, `is_important`, `is_secret`, `is_archived`, `is_pending`, `status`, `created_at`) VALUES
(139, '20251005192707', 'test123', 3, 3, 2, 80, 92, 2, NULL, 2, 102, 94, '120000.00', NULL, '2025-10-05', 'test', 'مشاجرة', 2, 1, 1, 1, 0, 'active', '2025-10-05 15:27:07'),
(142, '20251013104136', '8765432', 3, 2, 1, 80, 92, 2, NULL, 2, 95, 94, '1000.00', NULL, '2025-09-29', '', 'شيك مستحق ', 3, 0, 0, 0, 0, 'active', '2025-10-13 10:41:36'),
(143, '20251015154917', '2025', 25, 2, 1, 103, 104, 2, NULL, 1, 102, 105, '12000.00', NULL, '2025-10-15', 'اعداد لائحة دعوى ', 'مطالبة مدنية 50 ألف', 3, 0, 0, 0, 0, 'active', '2025-10-15 15:49:17'),
(144, '20251017063654', '370553', 3, 1, 1, 103, 104, 2, NULL, 2, 102, 105, '12000.00', NULL, '2025-10-20', '', 'مطالبة مالية ', 3, 0, 1, 0, 1, 'active', '2025-10-17 06:36:54'),
(147, '20251027073855', '876', 3, 2, 1, 80, 104, 2, NULL, 1, 95, 105, '6000.00', NULL, '2025-10-26', NULL, 'رأي عام', 1, 0, 0, 0, 0, 'active', '2025-10-27 07:38:55'),
(148, '20251027073904', '876', 3, 2, 1, 80, 104, 2, NULL, 1, 95, 105, '6000.00', NULL, '2025-10-26', NULL, 'رأي عام', 1, 0, 0, 0, 0, 'active', '2025-10-27 07:39:04'),
(149, '20251027073945', '876', 3, 2, 1, 80, 104, 2, NULL, 1, 95, 105, '6000.00', NULL, '2025-10-26', 'hahahah', 'رأي عام', 1, 0, 0, 0, 0, 'active', '2025-10-27 07:39:45'),
(156, '20251029171625', NULL, NULL, NULL, NULL, 73, 76, 2, NULL, 2, 95, 94, '0.00', NULL, '2025-10-29', NULL, NULL, 2, 0, 0, 0, 0, 'active', '2025-10-29 13:16:25'),
(157, '20251029171908', NULL, 3, 3, 2, 80, 92, 1, NULL, 2, 102, 94, '0.00', NULL, '2025-10-29', NULL, NULL, 3, 0, 0, 0, 0, 'active', '2025-10-29 13:19:08'),
(158, '20251030104824', '123456789999', 1, 2, 1, 96, 113, 1, NULL, 2, 102, 105, '1200000.00', NULL, '2025-10-30', '', '', 6, 0, 0, 0, 0, 'active', '2025-10-30 10:48:24'),
(159, '20251101062636', '1904', NULL, NULL, NULL, 73, 104, 2, NULL, 2, 102, 105, '10000.00', NULL, '2025-11-01', 'تقديم مذكرة دفاع ', 'قضيه جزائية - اهمال ام ', 3, 0, 0, 0, 0, 'active', '2025-11-01 06:26:36'),
(160, '20251101144357', '1150', NULL, NULL, NULL, 73, 104, 2, NULL, 1, 102, 105, '0.00', NULL, '2025-11-01', NULL, 'فسخ شراكة', 3, 0, 0, 0, 0, 'active', '2025-11-01 14:43:57');

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
  `client_status` varchar(255) DEFAULT NULL,
  `opponent_status` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `case_degrees`
--

INSERT INTO `case_degrees` (`id`, `case_id`, `degree`, `case_number`, `year`, `referral_date`, `client_status`, `opponent_status`, `created_at`, `updated_at`) VALUES
(45, 139, 'first_instance', '212111', '2025', '2025-10-05 00:00:00', NULL, NULL, '2025-10-05 15:27:08', '2025-10-05 15:27:08'),
(47, 142, 'first_instance', '123456', '2025', '2025-10-01 00:00:00', NULL, NULL, '2025-10-13 10:41:38', '2025-10-13 10:41:38'),
(50, 144, 'first_instance', '3705', '2025', '2025-10-21 00:00:00', NULL, NULL, '2025-10-17 06:36:56', '2025-10-17 06:36:56'),
(53, 147, 'appeal', '677', '2025', '2025-10-27 00:00:00', NULL, NULL, '2025-10-27 07:38:56', '2025-10-27 07:38:56'),
(54, 148, 'appeal', '677', '2025', '2025-10-27 00:00:00', NULL, NULL, '2025-10-27 07:39:05', '2025-10-27 07:39:05'),
(55, 149, 'appeal', '677', '2025', '2025-10-27 00:00:00', NULL, NULL, '2025-10-27 07:39:46', '2025-10-27 07:39:46'),
(60, 156, 'appeal', '2020', '2020', '2025-10-28 00:00:00', NULL, NULL, '2025-10-29 13:16:27', '2025-10-29 13:16:27'),
(61, 157, 'cassation', 'Test2', '6666', '2025-10-13 00:00:00', 'hgfdsa', 'htgfdsa', '2025-10-29 13:19:10', '2025-10-29 13:19:10'),
(64, 159, 'first_instance', '1904', '2025', '2025-10-31 00:00:00', NULL, NULL, '2025-11-01 06:26:37', '2025-11-01 06:26:37'),
(65, 160, 'first_instance', '1350', '2025', '2025-10-31 00:00:00', 'مدعي', 'مدعى عليه', '2025-11-01 14:44:00', '2025-11-01 14:44:00');

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
(82, 144, 53, 'opponent', NULL, '2025-10-17 06:36:55'),
(85, 147, 57, 'client', NULL, '2025-10-27 07:38:55'),
(86, 147, 53, 'opponent', NULL, '2025-10-27 07:38:56'),
(87, 148, 57, 'client', NULL, '2025-10-27 07:39:04'),
(88, 148, 53, 'opponent', NULL, '2025-10-27 07:39:05'),
(89, 149, 57, 'client', NULL, '2025-10-27 07:39:45'),
(90, 149, 53, 'opponent', NULL, '2025-10-27 07:39:46'),
(97, 156, 22, 'opponent', NULL, '2025-10-29 13:16:26'),
(98, 157, 20, 'client', NULL, '2025-10-29 13:19:09'),
(99, 157, 52, 'client', NULL, '2025-10-30 05:46:12'),
(100, 158, 20, 'client', NULL, '2025-10-30 10:48:24'),
(101, 158, 75, 'opponent', NULL, '2025-10-30 10:48:24'),
(102, 159, 76, 'opponent', NULL, '2025-11-01 06:26:37'),
(103, 159, 77, 'client', NULL, '2025-11-01 06:26:37'),
(104, 160, 78, 'client', NULL, '2025-11-01 14:43:59'),
(105, 160, 79, 'opponent', NULL, '2025-11-01 14:43:59');

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
(48, 144, '2025-10-13', 'حجز تخفظى ', '2025-10-20', 0, '2025-10-17 06:36:58', '2025-10-17 06:36:58'),
(51, 147, '2025-10-14', 'Hm', '2025-10-22', 1, '2025-10-27 07:38:57', '2025-10-27 07:38:57'),
(52, 148, '2025-10-14', 'Hm', '2025-10-22', 1, '2025-10-27 07:39:06', '2025-10-27 07:39:06'),
(53, 149, '2025-10-14', 'Hm', '2025-10-22', 1, '2025-10-27 07:39:47', '2025-10-27 07:39:47'),
(55, 160, '2025-10-30', 'منع سفر', '2025-11-07', 1, '2025-11-01 14:44:01', '2025-11-01 14:44:01');

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
(3, 'تجارية', 'Commercial ', '2025-09-18 06:16:57'),
(32, 'عمالية', 'work', '2025-10-30 01:36:33');

-- --------------------------------------------------------

--
-- بنية الجدول `cash_transaction_attachments`
--

CREATE TABLE `cash_transaction_attachments` (
  `id` int NOT NULL,
  `transaction_id` int NOT NULL,
  `attachment_url` varchar(1055) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_name` varchar(1055) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(7, 52, '5000.00', 'yearly', 'draft', '2025-10-06', '2025-10-13', '2025-10-21 12:28:04', 90),
(12, 20, '5432.00', 'normal', 'draft', '2025-10-07', '2025-10-06', '2025-10-26 10:23:42', 90),
(13, 57, '120000.00', 'normal', 'completed', '2025-10-01', '2025-11-01', '2025-10-30 07:16:46', 90);

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

--
-- إرجاع أو استيراد بيانات الجدول `deal_documents`
--

INSERT INTO `deal_documents` (`id`, `deal_id`, `document_name`, `document_url`, `created_at`, `created_by`) VALUES
(6, 13, 'certificate 3d printing.pdf', 'https://lexcora.s3.us-east-2.amazonaws.com/deal-documents/1761808605547-s3xjb6pf9d.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251030%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251030T071645Z&X-Amz-Expires=604800&X-Amz-Signature=9caf754e13b58fe7552a6e9879be6db3f10978df40f599d13f9b59f2832e6862&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-30 07:16:46', 90);

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
(3, 114, '2025-10-20', '100.00', 'تأخير', 90, '2025-10-20 10:28:45'),
(4, 95, '2025-10-03', '100.00', 'تأخير', 90, '2025-10-29 22:41:11');

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
-- بنية الجدول `global_settings`
--

CREATE TABLE `global_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name_ar` varchar(255) DEFAULT NULL,
  `company_name_en` varchar(255) DEFAULT NULL,
  `company_trn` varchar(50) DEFAULT NULL,
  `company_address_ar` text,
  `company_address_en` text,
  `company_phone` varchar(50) DEFAULT NULL,
  `company_email` varchar(100) DEFAULT NULL,
  `company_logo_url` varchar(500) DEFAULT NULL,
  `default_vat_rate` decimal(5,2) DEFAULT '5.00',
  `terms_conditions_ar` text,
  `terms_conditions_en` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `global_settings`
--

INSERT INTO `global_settings` (`company_name_ar`, `company_name_en`, `company_trn`, `company_address_ar`, `company_address_en`, `company_phone`, `company_email`, `default_vat_rate`) 
VALUES ('ليكسكورا للمحاماة والاستشارات القانونية', 'Lexcora Advocates & Legal Consultants', '100423000000003', 'دبي، الإمارات العربية المتحدة', 'Dubai, United Arab Emirates', '+971 4 000 0000', 'info@lexcora.com', 5.00);

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
  `registration_expiration_date` date DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employees`
--

INSERT INTO `employees` (`id`, `name`, `job_id`, `role_id`, `email`, `phone`, `username`, `department_id`, `eId`, `passport`, `branch_id`, `direct_manager_id`, `password`, `residence_end_date`, `id_end_date`, `passport_end_date`, `labor_card_end_date`, `health_insurance_end_date`, `contract_end_date`, `basic_salary`, `created_at`, `status`, `contract_type`, `bank_name`, `iban`, `account_number`, `pay_type`, `housing_allowance`, `trnsportation_allownce`, `last_login`, `fisrt_day_of_work`, `another_allownce`, `account_activation_date`, `account_close_date`, `registration_expiration_date`, `balance`) VALUES
(73, 'منتصر محمد سالم', '54321', 3, 'thmansai', '7654321', 'othman', 1, '87654321', NULL, NULL, NULL, '123456', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:22:18', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-19 19:49:23', NULL, '', NULL, NULL, NULL, '-300.00'),
(76, 'محمود احمد', '543217', 6, 'thmansai3', '7654321', 'othman33', 1, '87654321', NULL, 3, NULL, '1234563', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:26:04', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-05 16:15:55', NULL, '', NULL, NULL, NULL, '210.00'),
(80, 'مروى مسعد', '54321y7', 3, 'thmansai3', '7654321', 'ytyt', 1, '87654321', NULL, 1, NULL, '1234563u', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '2025-11-11', '0.00', '2025-09-19 22:28:09', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-30 02:40:40', NULL, '', NULL, NULL, NULL, '0.00'),
(90, 'admin', 'admin', 1, 'thman.saleh@gmai.lom', '0501455918', 'admin', 3, 'koijknlm', '76543265', 2, 91, 'almstkshfff111', NULL, '2029-09-30', NULL, NULL, '2029-09-30', NULL, '5000.00', '2025-09-20 13:00:56', 'active', 'جزئي', 'DIB', NULL, NULL, 'تحويل بنكي', '500', '500', '2025-11-05 17:38:01', '2025-10-09', '0', '2029-09-30', '2029-09-30', '2029-09-30', '0.00'),
(91, 'فضل ناصر', '81562', 3, 'THMan@4r4r.com', '0501455918', '81562', 3, '567890', '8765', 2, 76, 'othman', '2026-08-11', '2027-02-16', '2026-05-26', '2026-04-21', '2026-03-19', '2026-03-20', '7777.00', '2025-09-20 13:02:15', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-11-02 16:29:34', '2025-11-20', '0', NULL, NULL, '2026-02-11', '390.00'),
(92, 'منصور علي', '12323', 6, 'othman@123', '0501455918', 'othmansaleh', 5, 'iuytrdesw5', '5432df', 2, 90, 'othman', '2025-09-22', '2025-09-22', '2025-09-22', '2025-09-23', '2025-09-22', '2025-09-22', '3000.00', '2025-09-20 15:21:35', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-20 15:21:35', NULL, '', NULL, NULL, NULL, '0.00'),
(93, 'عبير عبدالستار', '21111', 4, 'thman.saleh@gmai.lom', '0501455918', '77168', 1, '99', '99', 2, 73, '211', '2025-09-17', '2025-09-22', '2025-09-21', '2025-09-17', '2025-09-15', '2025-09-14', '0.00', '2025-09-22 23:48:39', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-06 19:57:44', NULL, '', NULL, NULL, NULL, '-211.00'),
(94, 'حمزة سيف', '211', 5, 'thman.saleh@gmai.lom', '211', '211', 3, '211', '211', 2, 90, '211', '2025-09-26', '2025-09-29', '2025-09-28', '2025-09-04', '2025-09-09', '2025-09-07', '211.00', '2025-09-22 23:49:45', 'inactive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-22 23:49:45', NULL, '', NULL, NULL, NULL, '400.00'),
(95, 'تامر يونس', '11', 4, 'ceo@almstkshf.com', '0585400191', 'tamer', 3, '784197941306025', 'A18899765', 3, 103, '1234', '2026-06-01', '2026-05-28', '2026-08-01', '2025-10-30', '2026-06-01', '2025-10-30', '150000.00', '2025-10-05 20:17:14', 'inactive', 'كامل', 'adib', ' AE570351646006055158001', '16400605515001', 'wps', '1500', '1000', '2025-10-29 23:04:21', '2025-07-23', '500', '2025-07-23', NULL, '2025-11-12', '3321.00'),
(96, 'راشد المنصوري', '2002', 3, 'john.smith@email.com', '0501455918', '2002', 5, '098765432', '8282828', 3, 90, '278426', '2025-10-10', '2025-10-09', '2025-10-08', '2025-10-14', '2025-09-29', '2025-10-22', '4000.00', '2025-10-10 08:00:02', 'inactive', 'كامل', 'بنك دبي الاسلامي', '9876545678765434567', '76543245456765', 'تحويل بنكي', '500', '700', '2025-10-10 12:00:02', '2025-10-22', '500', '2025-10-13', '2025-10-15', NULL, '0.00'),
(97, 'ali', '4949', 10, 'thman.saleh@gmail.com', '050145094', '4949', 6, '7765645667754', '8765438654', 2, 95, '111111', '2025-10-10', '2025-10-08', '2025-10-22', '2025-10-14', '2025-10-07', '2025-10-12', '8000.00', '2025-10-13 02:01:46', 'active', 'كامل', 'FAB', '3456789087654', '98765456789', 'شيك', '500', '500', '2025-11-05 17:38:47', '2025-10-21', '0', '2025-10-14', '2025-10-28', '2025-10-19', '0.00'),
(102, 'شريف ', 'sherif', 4, 'essawys9999@gmail.com', '0556829149', 'sherif', 3, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:22:42', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-11-02 04:24:28', NULL, '0', NULL, NULL, NULL, '0.00'),
(103, 'محمد بنى هاشم ', '1', 2, 'Mohammed@mbh.com', '0506462864', '1', 1, NULL, NULL, 3, NULL, 'mbh123', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:24:21', 'inactive', 'كامل', NULL, NULL, NULL, NULL, '0', '0', '2025-10-29 23:16:06', NULL, '0', NULL, NULL, NULL, '180.00'),
(104, 'رنا ', 'rana', 6, 'rana@gmail.com', '05555555', 'rana', 5, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:37:42', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 10:03:32', NULL, '0', NULL, NULL, NULL, '300.00'),
(105, 'suhaa', 'suha', 5, 'suha@gmail.com', '0555555', 'suha', 1, NULL, NULL, 3, NULL, '570000', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:40:57', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 10:13:47', NULL, '0', NULL, NULL, NULL, '0.00'),
(108, 'شريف 2', '5700', 4, 'sherif@gmail.com', '0500000000', '5700', 3, NULL, NULL, 3, NULL, '339420', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-15 15:54:28', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-15 20:07:30', NULL, '0', NULL, NULL, NULL, '0.00'),
(113, 'رنا على  ', 'rana ali ', 6, 'rana@gmail.com', '0555555555', 'rana ali ', 3, NULL, NULL, 3, NULL, '221333', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-17 05:57:36', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-17 09:57:36', NULL, '0', NULL, NULL, NULL, '0.00'),
(114, 'Ashly Philip', 'MBH-AJM/Acc/60', 7, 'ashly-accounts@mbhadvocates.com', '0501122334', 'MBH-AJM/Acc/60', 4, '784-1998-4697762-9', 'P9839936', 3, 103, '99999', '2025-10-31', NULL, '2025-10-26', '2025-10-29', '2025-10-22', '2025-10-29', '1000.00', '2025-10-20 10:17:08', 'inactive', 'كامل', 'ADCB', NULL, NULL, 'wps', '1000', '1000', '2025-10-20 14:17:08', '2025-10-01', '1000', '2025-10-20', NULL, '2025-10-22', '0.00'),
(116, 'Ziad', '777', 4, '', '547811085', '777', 3, NULL, NULL, 3, 95, '197294', NULL, NULL, NULL, NULL, NULL, NULL, '1000.00', '2025-10-27 08:38:23', 'inactive', 'كامل', NULL, NULL, NULL, 'كاش', '0', '0', '2025-10-27 08:38:23', '2025-10-27', '0', NULL, NULL, NULL, '0.00'),
(117, 'رزان', '33', 8, 'Razan@mbh.com', '0505050505', '33', 5, NULL, NULL, 3, NULL, '863346', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-30 00:09:34', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-30 10:56:18', NULL, '0', NULL, NULL, NULL, '0.00'),
(118, 'Nour qandil', '12', 10, 'nour@mbh.com', '0545855668', '12', 6, NULL, NULL, 3, 103, '976418', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-30 00:13:03', 'inactive', 'كامل', NULL, NULL, NULL, 'كاش', '0', '0', '2025-10-30 00:13:03', '2024-09-01', '0', '2026-10-31', NULL, NULL, '5000.00'),
(119, 'Umar usman', '14', 7, 'omar@mbh.com', '0504159560', '14', 4, NULL, NULL, 3, 103, 'umar123', NULL, NULL, NULL, NULL, NULL, NULL, '0.00', '2025-10-30 00:15:12', 'inactive', NULL, NULL, NULL, NULL, NULL, '0', '0', '2025-10-30 01:15:23', NULL, '0', NULL, NULL, NULL, '0.00');

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
(8, 114, '2025-10-20 05:10:00', '2025-10-20 13:00:00', '2025-10-20 10:28:25', 90),
(9, 95, '2025-10-01 08:00:00', '2025-10-01 17:00:00', '2025-10-29 22:37:29', 90),
(10, 95, '2025-10-02 08:00:00', '2025-10-02 13:00:00', '2025-10-29 22:38:32', 90),
(11, 95, '2025-10-03 08:00:00', '2025-10-03 12:00:00', '2025-10-29 22:39:15', 90);

-- --------------------------------------------------------

--
-- بنية الجدول `employee_cash_transactions`
--

CREATE TABLE `employee_cash_transactions` (
  `id` int NOT NULL,
  `employee_id` int NOT NULL,
  `client_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('credit','debit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'credit',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `employee_cash_transactions`
--

INSERT INTO `employee_cash_transactions` (`id`, `employee_id`, `client_id`, `amount`, `type`, `description`, `created_by`, `created_at`, `status`) VALUES
(4, 91, NULL, '200.00', 'credit', 'test', 90, '2025-11-22 21:54:40', 'approved'),
(5, 91, NULL, '400.00', 'credit', NULL, 90, '2025-11-01 21:55:00', 'approved'),
(7, 103, NULL, '200.00', 'credit', 'test', 90, '2025-11-01 23:30:23', 'approved'),
(8, 103, NULL, '20.00', 'debit', 'test', 90, '2025-11-02 10:09:50', 'approved'),
(9, 76, NULL, '210.00', 'credit', 'ygtfrerfr', 90, '2025-11-18 12:22:38', 'approved'),
(10, 91, NULL, '200.00', 'debit', NULL, 90, '2025-11-02 14:06:22', 'approved'),
(12, 94, NULL, '400.00', 'credit', NULL, 90, '2025-11-06 20:08:50', 'approved'),
(13, 104, NULL, '300.00', 'credit', NULL, 90, '2025-11-02 20:09:07', 'approved'),
(14, 91, NULL, '10.00', 'debit', NULL, 90, '2025-11-02 20:09:32', 'approved'),
(15, 95, NULL, '4000.00', 'credit', NULL, 90, '2025-11-09 20:10:12', 'approved'),
(16, 118, NULL, '5000.00', 'credit', NULL, 90, '2025-11-02 20:10:34', 'approved'),
(17, 95, NULL, '400.00', 'debit', NULL, 90, '2025-11-29 20:10:53', 'approved'),
(18, 95, NULL, '39.00', 'debit', NULL, 90, '2025-11-02 20:11:12', 'approved'),
(19, 95, 30, '29.00', 'debit', 'test', 90, '2025-11-03 11:03:34', 'pending'),
(20, 95, NULL, '211.00', 'debit', NULL, 90, '2025-11-03 12:53:45', 'pending'),
(21, 93, 75, '211.00', 'debit', NULL, 90, '2025-11-03 13:26:25', 'pending'),
(23, 73, NULL, '12.00', 'debit', NULL, 90, '2025-11-04 10:35:35', 'pending'),
(24, 73, NULL, '288.00', 'debit', NULL, 90, '2025-11-04 10:36:17', 'pending');

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
(6, 90, 'cv', 'sessions_1760147239630-6h95klq91l4.pdf', 'https://mbn.9ede59b180ea59b7a50853f00d2bebdb.r2.cloudflarestorage.com/documents/1760169125934-pl8wftqumn.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=6b8cec64c9c9e276a5fa25d35d6110ab%2F20251011%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20251011T075207Z&X-Amz-Expires=604800&X-Amz-Signature=849298709d2e38d5283317955a241d49e6af8f1c8a29b898c5bed3641f48c8ba&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-11 07:52:07', 90),
(21, 95, 'cv', 'TFA Agreement (Freelancer) 1 .pdf', 'https://lexcora.s3.us-east-2.amazonaws.com/documents/1761778284615-5ybps552plw.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251029%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251029T225124Z&X-Amz-Expires=604800&X-Amz-Signature=9ff349e0dc5f2e30fad40d11d99ece2cb310c2996a9c00b508a958810c3dde1a&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-29 22:51:25', 90),
(22, 95, 'id', 'Screenshot_20220627-174448_Samsung Notes_Original.jpeg', 'https://lexcora.s3.us-east-2.amazonaws.com/documents/1761778324057-cqsj6nt72v.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251029%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251029T225204Z&X-Amz-Expires=604800&X-Amz-Signature=3242a1b4ddda49013e7775e89aaa16999abb1f248ea8e2014a177620e38a65e1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-29 22:52:04', 90),
(23, 95, 'education_certificate', 'IMG_0129.jpeg', 'https://lexcora.s3.us-east-2.amazonaws.com/documents/1761778505554-unnvn5yyxh.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251029%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251029T225505Z&X-Amz-Expires=604800&X-Amz-Signature=4b574f53468ea62f33a28986717ed6ff6ce639a5da37d270e49bef05732f4f48&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '2025-10-29 22:55:06', 90);

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
(1251, 222, 97),
(1252, 214, 97),
(1253, 225, 97),
(1254, 217, 97),
(1255, 224, 97),
(1256, 227, 97),
(1257, 228, 97),
(1258, 223, 97),
(1259, 229, 97);

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
(4, 93, '2025-10-13', 'اخرى', NULL, NULL, 'rejected', 'approved', 90, '2025-10-13 03:53:38'),
(6, 97, '2025-10-09', 'شهادة خبرة', NULL, NULL, 'approved', 'approved', 90, '2025-10-13 10:52:04'),
(7, 91, '2025-10-09', 'شهادة خبرة', NULL, NULL, 'rejected', 'rejected', 97, '2025-10-14 22:41:12'),
(8, 102, '2025-10-14', 'اجازة مرضية', '2025-10-26', '2025-10-28', 'rejected', 'rejected', 90, '2025-10-15 15:30:16'),
(9, 108, '2025-10-15', 'اجازة سنوية', '2025-11-01', '2025-11-15', 'approved', 'approved', 108, '2025-10-15 16:04:50'),
(11, 80, '2025-10-02', 'اجازة سنوية', '2025-10-01', '2025-10-15', 'rejected', 'approved', 90, '2025-10-20 19:08:37'),
(15, 95, '2025-10-22', 'اجازة تفرغ لإداء الخدمة الوطنية', '2025-10-23', '2025-10-31', 'approved', 'rejected', 90, '2025-10-22 03:59:38'),
(16, 80, '2025-10-08', 'اجازة الوضع', '2025-10-08', '2025-10-30', 'rejected', 'rejected', 90, '2025-10-27 08:47:54'),
(17, 80, '2025-10-22', 'شهادة خبرة', NULL, NULL, 'approved', 'approved', 90, '2025-10-30 01:04:27'),
(19, 117, '2025-11-08', 'اجازة الوضع', '2025-09-30', '2025-11-01', 'approved', 'approved', 90, '2025-10-30 01:32:59'),
(20, 80, '2025-10-17', 'إذن خروج', '2025-10-23', '2025-10-23', 'pending', 'pending', 80, '2025-10-30 03:39:27'),
(21, 80, '2025-10-30', 'إجازة طارئة', '2025-10-10', '2025-10-08', 'pending', 'pending', 80, '2025-10-30 03:43:40'),
(22, 80, '2025-10-30', 'تعويض ساعات عمل', '2025-10-30', '2025-10-16', 'pending', 'pending', 80, '2025-10-30 03:44:37'),
(23, 80, '2025-10-30', 'اجازة سنوية', '2025-10-31', '2025-10-30', 'rejected', 'approved', 80, '2025-10-30 03:52:17'),
(24, 80, '2025-10-30', 'اجازة التفرغ لإداء الخدمة الوطنية', '2025-10-30', '2025-12-04', 'approved', 'rejected', 80, '2025-10-30 03:56:05'),
(25, 91, '2025-10-30', 'اجازة الوضع', '2025-10-30', '2025-10-31', 'pending', 'pending', 90, '2025-10-30 04:00:39'),
(26, 80, '2025-10-30', 'شهادة خبرة', NULL, NULL, 'approved', 'approved', 80, '2025-10-30 04:04:58'),
(28, 114, '2025-10-30', 'شهادة خبرة', NULL, NULL, 'approved', 'approved', 90, '2025-10-30 04:10:54'),
(32, 97, '2025-10-30', 'شهادة خبرة', NULL, NULL, 'pending', 'pending', 97, '2025-10-30 07:00:03'),
(33, 97, '2025-10-30', 'شهادة لا مانع', NULL, NULL, 'pending', 'pending', 97, '2025-10-30 07:02:56'),
(34, 97, '2025-10-30', 'اجازة الوضع', '2025-11-01', '2025-11-26', 'approved', 'pending', 97, '2025-10-30 07:03:25');

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
(2, 'ورشة عمل', 'فندق العنوان', '2025-10-07', '09:00:00', '11:00:00', 'meetings', '2025-10-13 05:54:04', 90),
(4, 'test', 'dubai ', '2025-10-01', '01:00:00', '01:00:00', 'test', '2025-10-30 02:39:31', NULL),
(5, 'test', 'rcdwsx', '2025-10-09', '01:00:00', '01:00:00', 'rde3wsd', '2025-10-30 02:42:08', NULL);

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
(31, 2, 97),
(47, 4, 80),
(48, 5, 80);

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
(33, 142, NULL, '2025-10-01', 'منع من السفر', '500000.00', 'in_progress', NULL, NULL, '2025-10-13 10:41:40'),
(37, 147, NULL, '2025-10-07', 'Hm', '5000.00', 'in_progress', NULL, NULL, '2025-10-27 07:38:58'),
(38, 148, NULL, '2025-10-07', 'Hm', '5000.00', 'in_progress', NULL, NULL, '2025-10-27 07:39:07'),
(39, 149, NULL, '2025-10-07', 'Hm', '5000.00', 'in_progress', NULL, NULL, '2025-10-27 07:39:48'),
(41, 160, NULL, '2025-11-01', 'الغاء الخجز التنفيذي على الارصده', '0.00', 'pending', NULL, NULL, '2025-11-01 14:44:03');

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
(4, 'نيابة دبي', 'https://www.dxbpp.gov.ae/', 90, '2025-10-17 10:40:15'),
(7, 'المستكشف', 'https://www.almstkshf.com', 90, '2025-11-04 10:21:19');

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
(12, 'https://pub-287a8516365548cdb4ac9012e23f194a.r2.dev/forms/Sickness%20self-certificate.pdf', 'sickness self certificate', '2025-10-15 01:41:10'),
(16, 'https://lexcora.s3.us-east-2.amazonaws.com/forms/1761799816131-gw85ltifj37.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251030%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251030T045044Z&X-Amz-Expires=604800&X-Amz-Signature=190f8db43590a3df971d6b07e7c1ef00107455639e1706dbfef494146eb3ba67&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 'others', '2025-10-30 04:50:44'),
(17, 'https://lexcora.s3.us-east-2.amazonaws.com/forms/1761842349753-6oewermvb9n.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251030%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251030T163910Z&X-Amz-Expires=604800&X-Amz-Signature=7eaa50fa993f6e5cfa246c568979c52d7316c9d0b18b803451fe61b5ffa59d12&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 'others', '2025-10-30 16:39:10'),
(18, 'https://lexcora.s3.us-east-2.amazonaws.com/forms/1762022030239-7sa7eyjyzfb.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251101T183350Z&X-Amz-Expires=604800&X-Amz-Signature=4ee25fcdb4e3679b9922157c6b71d9e7c8edb64e343cd85ae35b9e5e7c77e0de&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 'others', '2025-11-01 18:33:51');

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
(7, '76543', '87654', 'compliant', NULL, 'منظمة', 90, '2025-10-22 23:43:52'),
(8, 'خليفة محمد تركي السبيعي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): السبيعي\nاسم العائلة (بالحروف اللاتينية): AL SUBAEY\nالاسم الكامل (بالحروف اللاتينية): KHALIFA MOHD T AL SUBAEY\nتاريخ الميلاد: 1964-12-31\nمكان الميلاد: قطر\nالاسم: خليفة محمد تركي السبيعي\nالدولة: قطر\nالنوع: جواز سفر\nرقم الوثيقة: 685868\nجهة الإصدار: قطر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:19'),
(9, 'عبد الملك محمد يوسف عبد السلام', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الأردن\nاسم العائلة (بالحروف العربية): عبدالسلام\nاسم العائلة (بالحروف اللاتينية): ABDELSALAM\nالاسم الكامل (بالحروف اللاتينية): ABDULMALIK MOHAMMAD YOUSEF ABDELSALAM\nتاريخ الميلاد: 1989-07-12\nمكان الميلاد: العراق\nالاسم: عبد الملك محمد يوسف عبد السلام\nالدولة: قطر\nالنوع: جواز سفر\nرقم الوثيقة: 475336\nجهة الإصدار: الأردن\nتاريخ الإصدار: 2012-05-28\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:20'),
(10, 'أشرف محمد يوسف عثمان عبد السلام', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الأردن\nاسم العائلة (بالحروف العربية): عبدالسلام\nاسم العائلة (بالحروف اللاتينية): ABD AL SALAM\nالاسم الكامل (بالحروف اللاتينية): ASHRAF MUHAMMAD YUSUF UTHMAN ABD ALSALAM\nالاسم: أشرف محمد يوسف عثمان عبد السلام\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:21'),
(11, 'إبراهيم عيسى الحجي محمد الباكر', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الباكر\nاسم العائلة (بالحروف اللاتينية): AL-BAKR\nالاسم الكامل (بالحروف اللاتينية): IBRAHIM \'ISA HAJJI MUHAMMAD AL-BAKR\nتاريخ الميلاد: 1977-07-11\nالاسم: إبراهيم عيسى الحجي محمد الباكر (أبوخليل)\nالدولة: قطر\nالنوع: جواز سفر\nرقم الوثيقة: 01016646\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:21'),
(12, 'عبد العزيز بن خليفة العطية', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): العطية\nاسم العائلة (بالحروف اللاتينية): ALATTIYAH\nالاسم الكامل (بالحروف اللاتينية): ABDULAZIZ BIN KHALIFA ALATTIYAH\nالاسم: عبد العزيز بن خليفة العطية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:22'),
(13, 'سالم حسن خليفة راشد الكواري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الكواري\nاسم العائلة (بالحروف اللاتينية): AL-KUWARI\nالاسم الكامل (بالحروف اللاتينية): SALIM HASAN KHALIFA RASHID AL-KUWARI\nالاسم: سالم حسن خليفة راشد الكواري\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:23'),
(14, 'عبد الله غانم محفوظ مسلم الخوار', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الخوار\nاسم العائلة (بالحروف اللاتينية): AL-KHAWAR\nالاسم الكامل (بالحروف اللاتينية): ABDALLAH GHANIM MAHFUZ MUSLIM AL-KHAWAR\nتاريخ الميلاد: 1981-12-16\nالاسم: عبد الله غانم محفوظ مسلم الخوار\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:23'),
(15, 'سعد بن سعد محمد الكعبي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الكعبي\nاسم العائلة (بالحروف اللاتينية): AL-KA\'BI\nالاسم الكامل (بالحروف اللاتينية): SA\'D BIN SA\'D MUHAMMAD SHARIAN AL-KA\'BI\nالاسم: سعد بن سعد محمد الكعبي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:24'),
(16, 'عبد اللطيف بن عبد الله الكواري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الكواري\nاسم العائلة (بالحروف اللاتينية): AL-KUWARI\nالاسم الكامل (بالحروف اللاتينية): ABD AL-LATIF BIN ABDALLAH SALIH MUHAMMAD AL-KAWARI\nتاريخ الميلاد: 1973-09-27\nالاسم: عبد اللطيف بن عبد الله الكواري\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:25'),
(17, 'عبد الرحمن بن عمير النعيمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): النعيمي\nاسم العائلة (بالحروف اللاتينية): AL-NU\'AYMI\nالاسم الكامل (بالحروف اللاتينية): ABD AL-RAHMAN BIN \'UMAYR AL-NU\'AYMI\nتاريخ الميلاد: 1951-05-05\nالاسم: عبد الرحمن بن عمير النعيمي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:25'),
(18, 'عبد الوهاب محمد عبد الرحمن الحميقاني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): الحميقاني\nاسم العائلة (بالحروف اللاتينية): AL-HUMAYQANI\nالاسم الكامل (بالحروف اللاتينية): ABD AL-WAHHAB MUHAMMAD ABD AL-RAHMAN AL-HUMAYQANI\nالاسم: عبد الوهاب محمد عبد الرحمن الحميقاني\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:26'),
(19, 'حجاج بن فهد حجاج محمد العجمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الكويت\nاسم العائلة (بالحروف العربية): العجمي\nاسم العائلة (بالحروف اللاتينية): AL-AJMI\nالاسم الكامل (بالحروف اللاتينية): HAJJAJ BIN FAHD HAJJAJ MUHAMMAD AL-AJMI\nتاريخ الميلاد: 1987-08-09\nمكان الميلاد: الكويت\nالاسم: حجاج بن فهد حجاج محمد العجمي\nالنوع: جواز سفر\nرقم الوثيقة: 107706887\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:26'),
(20, 'يوسف عبد الله القرضاوي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): القرضاوي\nاسم العائلة (بالحروف اللاتينية): AL-QARADAWI\nالاسم الكامل (بالحروف اللاتينية): YUSUF ABDULLAH AL-QARADAWI\nتاريخ الميلاد: 1963-01-12\nمكان الميلاد: مصر\nالاسم: يوسف عبد الله القرضاوي\nالدولة: قطر\nالنوع: جواز سفر\nرقم الوثيقة: 5113\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:27'),
(21, 'علي محمد محمد الصلابي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): الصلابي\nاسم العائلة (بالحروف اللاتينية): AL-SALLABI\nالاسم الكامل (بالحروف اللاتينية): ALI MOHAMMED MOHAMMED AL-SALLABI\nتاريخ الميلاد: 1975-12-31\nمكان الميلاد: ليبيا\nالاسم: علي محمد محمد الصلابي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:27'),
(22, 'عبد الحكيم بلحاج', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): بلحاج\nاسم العائلة (بالحروف اللاتينية): BELHAJ\nالاسم الكامل (بالحروف اللاتينية): ABD AL-HAKIM BELHAJ\nتاريخ الميلاد: 1966-04-30\nمكان الميلاد: ليبيا\nالاسم: عبد الحكيم بلحاج\nالنوع: جواز سفر\nرقم الوثيقة: 454365\nجهة الإصدار: ليبيا\nتاريخ الانتهاء: 2020-09-05\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:28'),
(23, 'مهدي الحاراتي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): الحاراتي\nاسم العائلة (بالحروف اللاتينية): AL-HARATI\nالاسم الكامل (بالحروف اللاتينية): MAHDI AL-HARATI\nتاريخ الميلاد: 1905-05-28\nمكان الميلاد: ليبيا\nالاسم: مهدي الحاراتي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:28'),
(24, 'إسماعيل محمد محمد الصلابي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): الصلابي\nاسم العائلة (بالحروف اللاتينية): AL-SALLABI\nالاسم الكامل (بالحروف اللاتينية): ISMAIL MOHAMMED MOHAMMED AL-SALLABI\nالاسم: إسماعيل محمد محمد الصلابي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:29'),
(25, 'الصادق عبد الرحمن علي الغرياني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): الغرياني\nاسم العائلة (بالحروف اللاتينية): AL-QHRIANY\nالاسم الكامل (بالحروف اللاتينية): AL-SADIQ ABD-ALRAHMAN ALI AL-QHRIANY\nتاريخ الميلاد: 1942-12-07\nمكان الميلاد: طرابلس - ليبيا\nالاسم: الصادق عبد الرحمن علي الغرياني\nالمدينة: طرابلس\nالدولة: ليبيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:30'),
(26, 'محمد أحمد شوقي الإسلامبولي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): الاسلامبولي\nاسم العائلة (بالحروف اللاتينية): ISLAMBOULI\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED AHMED SHAWQI ISLAMBOULI\nتاريخ الميلاد: 1952-01-20\nمكان الميلاد: نجع حمادي-قنا\nالاسم: محمد أحمد شوقي الإسلامبولي\nالنوع: جواز سفر\nرقم الوثيقة: 304555\nجهة الإصدار: مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:30'),
(27, 'طارق عبد الموجود إبراهيم الزمر', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): الزمر\nاسم العائلة (بالحروف اللاتينية): AL-ZUMAR\nالاسم الكامل (بالحروف اللاتينية): TAREK ABD AL-MAWGOUD IBRAHIM AL-ZUMAR\nتاريخ الميلاد: 1959-05-14\nمكان الميلاد: مصر\nالاسم: طارق عبد الموجود إبراهيم الزمر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:31'),
(28, 'محمد عبد المقصود محمد عفيفي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عفيفي\nاسم العائلة (بالحروف اللاتينية): AFIFI\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED ABD AL-MAQSOUD MOHAMMED AFIFI\nتاريخ الميلاد: 1947-07-13\nمكان الميلاد: مصر\nالاسم: محمد عبد المقصود محمد عفيفي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:31'),
(29, 'محمد الصغير عبد الرحيم محمد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): محمد\nاسم العائلة (بالحروف اللاتينية): MOHAMMED\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD ELSAGHEER ABD AL-RAHIM MOHAMMED\nتاريخ الميلاد: 1970-04-12\nمكان الميلاد: مصر - القاهرة\nالاسم: محمد الصغير عبد الرحيم محمد\nالنوع: جواز سفر\nرقم الوثيقة: A08670835\nجهة الإصدار: مصر\nتاريخ الانتهاء: 2019-12-31\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:32'),
(30, 'وجدي عبد الحميد محمد غنيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): غنيم\nاسم العائلة (بالحروف اللاتينية): GHONIEM\nالاسم الكامل (بالحروف اللاتينية): WAGDY ABDEL HAMIED MOHAMED GHONIEM\nتاريخ الميلاد: 1951-08-01\nمكان الميلاد: سوهاج - مصر\nالاسم: وجدي عبد الحميد محمد غنيم\nالنوع: جواز سفر\nرقم الوثيقة: 4155047\nجهة الإصدار: مصر\nتاريخ الانتهاء: 2015-07-04\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:32'),
(31, 'حسن أحمد حسن محمد الدقي الهوتي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الامارات\nاسم العائلة (بالحروف العربية): الهوتي\nاسم العائلة (بالحروف اللاتينية): AL-HOUTI\nالاسم الكامل (بالحروف اللاتينية): HASSAN AHMED HASSAN MOHAMED AL-DIQQI AL-HOUTI\nتاريخ الميلاد: 1957-01-02\nمكان الميلاد: الشارقة\nالاسم: حسن أحمد حسن محمد الدقي الهوتي\nالشارع: بشاك شهير\nالمدينة: إسطنبول\nالدولة: تركيا\nالنوع: جواز السفر\nرقم الوثيقة: 2116728\nجهة الإصدار: الامارات\nتاريخ الإصدار: 2008-07-23\nتاريخ الانتهاء: 2013-07-22\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:33'),
(32, 'حاكم عبيسان الحميدي المطيري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: السعودية / الكويت\nاسم العائلة (بالحروف العربية): المطيري\nاسم العائلة (بالحروف اللاتينية): AL-MUTAIRI\nالاسم الكامل (بالحروف اللاتينية): HAKEM OBAYSAN AL-HAMIDI AL-MUTAIRI\nتاريخ الميلاد: 1964-11-06\nمكان الميلاد: الكويت\nالاسم: حاكم عبيسان الحميدي المطيري\nالشارع: بشاك شهير\nالمدينة: إسطنبول\nالدولة: تركيا\nالنوع: جواز السفر\nرقم الوثيقة: 3229745\nجهة الإصدار: الكويت\nتاريخ الإصدار: 16/05/2011\nتاريخ الانتهاء: 2021-05-14\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:34'),
(33, 'عبد الله محمد بن سليمان المحيسني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: السعوديه\nاسم العائلة (بالحروف العربية): المحيسني\nاسم العائلة (بالحروف اللاتينية): AL-MUHAYSINI\nالاسم الكامل (بالحروف اللاتينية): ABDALLAH MUHAMMAD BIN SULAYMAN AL-MUHAYSINI\nتاريخ الميلاد: 1987-10-29\nالاسم: عبد الله محمد بن سليمان المحيسني\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:34'),
(34, 'حامد عبد الله أحمد العلي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الكويت\nاسم العائلة (بالحروف العربية): العلي\nاسم العائلة (بالحروف اللاتينية): AL-ALI\nالاسم الكامل (بالحروف اللاتينية): HAMID ABDALLAH AHMAD AL-ALI\nتاريخ الميلاد: 1960-01-19\nمكان الميلاد: الكويت\nالاسم: حامد عبد الله أحمد العلي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:35'),
(35, 'أيمن أحمد عبد الغني حسنين', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): حسنين\nاسم العائلة (بالحروف اللاتينية): HASSANEIN\nالاسم الكامل (بالحروف اللاتينية): AYMAN AHMED ABDUL GHANI HASSANEIN\nتاريخ الميلاد: 1964-10-31\nمكان الميلاد: مصر\nالاسم: أيمن أحمد عبد الغني حسنين\nالدولة: مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:35'),
(36, 'عاصم عبد الماجد محمد ماضي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): ماضي\nاسم العائلة (بالحروف اللاتينية): MADI\nالاسم الكامل (بالحروف اللاتينية): ASSEM ABDEL-MAGED MOHAMMED MADI\nتاريخ الميلاد: 1905-05-11\nمكان الميلاد: مصر (المينا)\nالاسم: عاصم عبد الماجد محمد ماضي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:36'),
(37, 'يحيى عقيل سالمان عقيل', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عقيل\nاسم العائلة (بالحروف اللاتينية): AQEEL\nالاسم الكامل (بالحروف اللاتينية): YAHYA AQIL SALMAN AQEEL\nمكان الميلاد: مصر\nالاسم: يحيى عقيل سالمان عقيل\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:37'),
(38, 'محمد حمادة السيد إبراهيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): إبراهيم\nاسم العائلة (بالحروف اللاتينية): IBRAHIM\nالاسم الكامل (بالحروف اللاتينية): MOHAMED HAMADA EL-SAYED IBRAHIM\nتاريخ الميلاد: 1982-01-19\nمكان الميلاد: مصر\nالاسم: محمد حمادة السيد إبراهيم\nالنوع: جواز سفر\nرقم الوثيقة: 11180132\nجهة الإصدار: مصر\nتاريخ الإصدار: 2012-12-31\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:38'),
(39, 'عبد الرحمن محمد شكري عبد الرحمن', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عبدالرحمن\nاسم العائلة (بالحروف اللاتينية): ABDEL RAHMAN\nالاسم الكامل (بالحروف اللاتينية): ABDEL RAHMAN MOHAMED SHOKRY ABDEL RAHMAN\nتاريخ الميلاد: 1905-04-30\nمكان الميلاد: مصر\nالاسم: عبد الرحمن محمد شكري عبد الرحمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:38'),
(40, 'حسين محمد رضا إبراهيم يوسف', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): يوسف\nاسم العائلة (بالحروف اللاتينية): YOUSSEF\nالاسم الكامل (بالحروف اللاتينية): HUSSEIN MOHAMED REZA IBRAHIM YOUSSEF\nمكان الميلاد: مصر\nالاسم: حسين محمد رضا إبراهيم يوسف\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:39'),
(41, 'أحمد عبد الحافظ محمود عبد الهدى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عبدالهدى\nاسم العائلة (بالحروف اللاتينية): ABDELHADY\nالاسم الكامل (بالحروف اللاتينية): AHMED ABDELHAFID MAHMOUD ABDELHADY\nمكان الميلاد: مصر\nالاسم: أحمد عبد الحافظ محمود عبد الهدى\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:39'),
(42, 'مسلم فؤاد طرفان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): طرفان\nاسم العائلة (بالحروف اللاتينية): TARFAN\nالاسم الكامل (بالحروف اللاتينية): MUSLIM FOUAD TARFAN\nالاسم: مسلم فؤاد طرفان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:40'),
(43, 'أيمن محمود صادق رفعت', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): رفعت\nاسم العائلة (بالحروف اللاتينية): RIFAT\nالاسم الكامل (بالحروف اللاتينية): AYMAN MAHMOUD SADEQ RIFAT\nتاريخ الميلاد: 1905-05-23\nمكان الميلاد: مصر (الجيزة)\nالاسم: أيمن محمود صادق رفعت\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:41'),
(44, 'محمد سعد عبد النعيم أحمد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): أحمد\nاسم العائلة (بالحروف اللاتينية): AHMED\nالاسم الكامل (بالحروف اللاتينية): MOHAMED SAAD ABDEL-NAIM AHMED\nالاسم: محمد سعد عبد النعيم أحمد\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:41'),
(45, 'محمد سعد عبد المطلب عبده الرازفي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): الرازقي\nاسم العائلة (بالحروف اللاتينية): AL-RAZAKI\nالاسم الكامل (بالحروف اللاتينية): MOHAMED SAAD ABDEL MUTTALIB ABDO AL-RAZAFI\nالاسم: محمد سعد عبد المطلب عبده الرازفي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:42'),
(46, 'أحمد فؤاد أحمد جاد بلتاجي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): بلتاجي\nاسم العائلة (بالحروف اللاتينية): BELTAGY\nالاسم الكامل (بالحروف اللاتينية): AHMED FOUAD AHMED GAD BELTAGY\nتاريخ الميلاد: 1979-12-31\nالاسم: أحمد فؤاد أحمد جاد بلتاجي\nالنوع: جواز سفر\nرقم الوثيقة: 1147218\nجهة الإصدار: مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:43'),
(47, 'أحمد رجب رجب سليمان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): سليمان\nاسم العائلة (بالحروف اللاتينية): SOLIMAN\nالاسم الكامل (بالحروف اللاتينية): AHMED RAGEB RAGEB SOLIMAN\nالاسم: أحمد رجب رجب سليمان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:43'),
(48, 'كريم محمد محمد عبد العزيز', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عبدالعزيز\nاسم العائلة (بالحروف اللاتينية): ABDEL AZIZ\nالاسم الكامل (بالحروف اللاتينية): KARIM MOHAMED MOHAMED ABDEL AZIZ\nمكان الميلاد: مصر\nالاسم: كريم محمد محمد عبد العزيز\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:44'),
(49, 'علي زكي محمد علي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): علي\nاسم العائلة (بالحروف اللاتينية): ALI\nالاسم الكامل (بالحروف اللاتينية): ALI ZAKI MOHAMMED ALI\nالاسم: علي زكي محمد علي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:44'),
(50, 'ناجي إبراهيم العزولي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): العزولي\nاسم العائلة (بالحروف اللاتينية): EZZOULI\nالاسم الكامل (بالحروف اللاتينية): NAJI IBRAHIM EZZOULI\nمكان الميلاد: مصر\nالاسم: ناجي إبراهيم العزولي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:45'),
(51, 'شحاتة فتحي حافظ محمد سليمان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): سليمان\nاسم العائلة (بالحروف اللاتينية): SULEIMAN\nالاسم الكامل (بالحروف اللاتينية): SHEHATA FATHI HAFEZ MOHAMMED SULEIMAN\nمكان الميلاد: مصر\nالاسم: شحاتة فتحي حافظ محمد سليمان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:45'),
(52, 'محمد محرم فهمي أبو زيد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): أبو زيد\nاسم العائلة (بالحروف اللاتينية): ABU ZEID\nالاسم الكامل (بالحروف اللاتينية): MUHAMMAD MUHARRAM FAHMI ABU ZEID\nمكان الميلاد: مصر\nالاسم: محمد محرم فهمي أبو زيد\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:46'),
(53, 'عمرو عبد الناصر عبد الحق عبد الباري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عبدالباري\nاسم العائلة (بالحروف اللاتينية): ABDEL-BARRY\nالاسم الكامل (بالحروف اللاتينية): AMR ABDEL NASSER ABDELHAK ABDEL-BARRY\nمكان الميلاد: مصر\nالاسم: عمرو عبد الناصر عبد الحق عبد الباري\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:47'),
(54, 'علي حسن إبراهيم عبد الظاهر', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): الظاهر\nاسم العائلة (بالحروف اللاتينية): ABDEL-ZAHER\nالاسم الكامل (بالحروف اللاتينية): ALI HASSAN IBRAHIM ABDEL-ZAHER\nالاسم: علي حسن إبراهيم عبد الظاهر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:47'),
(55, 'مرتضى مجيد السندي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: البحرين\nاسم العائلة (بالحروف العربية): السندي\nاسم العائلة (بالحروف اللاتينية): AL-SINDI\nالاسم الكامل (بالحروف اللاتينية): MURTADHA MAJEED AL-SINDI\nالاسم: مرتضى مجيد السندي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:48'),
(56, 'أحمد الحسن الدعسكي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: البحرين\nاسم العائلة (بالحروف العربية): الدعسكي\nاسم العائلة (بالحروف اللاتينية): AL-DASKI\nالاسم الكامل (بالحروف اللاتينية): AHMED AL-HASSAN AL-DASKI\nالاسم: أحمد الحسن الدعسكي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:48'),
(57, 'عبد الله محمد علي اليزيدي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): اليزيدي\nاسم العائلة (بالحروف اللاتينية): AL-YAZIDI\nالاسم الكامل (بالحروف اللاتينية): ABDULLAH MOHAMMED AL-YAZIDI\nتاريخ الميلاد: 1956-12-31\nمكان الميلاد: اليمن\nالاسم: عبد الله محمد علي اليزيدي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:49'),
(58, 'أحمد علي أحمد برعود', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): برعود\nاسم العائلة (بالحروف اللاتينية): BAROAUD\nالاسم الكامل (بالحروف اللاتينية): AHMED ALI AHMED BAROAUD\nتاريخ الميلاد: 1964-12-31\nمكان الميلاد: اليمن\nالاسم: أحمد علي أحمد برعود\nالمدينة: حضرموت\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:50'),
(59, 'محمد بكر الدباء', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): الدباء\nاسم العائلة (بالحروف اللاتينية): AL-DABAA\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED BAKR AL-DABAA\nتاريخ الميلاد: 1958-01-07\nمكان الميلاد: اليمن\nالاسم: محمد بكر الدباء\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:50'),
(60, 'حامد حمد حامد العلي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الكويت\nاسم العائلة (بالحروف العربية): العلي\nاسم العائلة (بالحروف اللاتينية): AL-\'ALI\nالاسم الكامل (بالحروف اللاتينية): HAMID HAMAD HAMID AL-\'ALI\nتاريخ الميلاد: 1960-02-16\nمكان الميلاد: الكويت\nالاسم: حامد حمد حامد العلي\nالنوع: جواز سفر\nرقم الوثيقة: 101505554\nجهة الإصدار: الكويت\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:51'),
(61, 'الساعدي عبد الله إبراهيم أبو خزيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): أبو خزيم\nاسم العائلة (بالحروف اللاتينية): BUKHAZEM\nالاسم الكامل (بالحروف اللاتينية): AL-SAADI ABDULLAH IBRAHIM BUKHAZEM\nتاريخ الميلاد: 1981-11-20\nمكان الميلاد: ليبيا\nالاسم: الساعدي عبد الله إبراهيم أبو خزيم\nالمدينة: أجدابيا\nالدولة: ليبيا\nالنوع: جواز سفر\nجهة الإصدار: ليبيا\nتاريخ الإصدار: 2019-09-10\nتاريخ الانتهاء: 2025-09-09\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:52'),
(62, 'أحمد عبد الجليل الحسناوي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): الحسناوي\nاسم العائلة (بالحروف اللاتينية): AL-HASNAWI\nالاسم الكامل (بالحروف اللاتينية): AHMED ABD AL-JALEEL AL-HASNAWI\nمكان الميلاد: ليبيا\nالاسم: أحمد عبد الجليل الحسناوي\nالشارع: حي الشارب\nالمدينة: أوباري\nالدولة: ليبيا\nالنوع: الرقم الموحد\nرقم الوثيقة: 54390612\nجهة الإصدار: ليبيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:52'),
(63, 'نايف صالح سالم القيسي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): القيسي\nاسم العائلة (بالحروف اللاتينية): AL-QAYSI\nالاسم الكامل (بالحروف اللاتينية): NAYIF SALIH SALIM AL-QAYSI\nتاريخ الميلاد: 1905-06-05\nمكان الميلاد: اليمن\nالاسم: نايف صالح سالم القيسي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:53'),
(64, 'هاشم محسن عيدروس', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): عيدروس\nاسم العائلة (بالحروف اللاتينية): AYDARUS\nالاسم الكامل (بالحروف اللاتينية): HASHIM MUHSIN AYDARUS\nتاريخ الميلاد: 1985-12-11\nمكان الميلاد: جدة - المملكة العربية السعودية\nالاسم: هاشم محسن عيدروس\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:54'),
(65, 'نشوان العدني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): العدني\nاسم العائلة (بالحروف اللاتينية): AL-ADANI\nالاسم الكامل (بالحروف اللاتينية): NASHWAN AL-ADANI\nتاريخ الميلاد: 1988-01-12\nالاسم: نشوان العدني\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:54'),
(66, 'خالد عبد الله المرفدي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): المرفدي\nاسم العائلة (بالحروف اللاتينية): AL-MARFADI\nالاسم الكامل (بالحروف اللاتينية): KHALID ABDULLAH AL-MARFADI\nتاريخ الميلاد: 1966-09-03\nالاسم: خالد عبد الله المرفدي\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:55'),
(67, 'سيف الرب سالم الحيشي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): الحيشي\nاسم العائلة (بالحروف اللاتينية): AL-HEESHI\nالاسم الكامل (بالحروف اللاتينية): SAIFULRAB SALIM AL-HEESHI\nتاريخ الميلاد: 1977-12-31\nمكان الميلاد: اليمن\nالاسم: سيف الرب سالم الحيشي\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:56'),
(68, 'عادل عبده فاري عثمان الذهباني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): الذهباني\nاسم العائلة (بالحروف اللاتينية): AL-THAHBANI\nالاسم الكامل (بالحروف اللاتينية): ADEL ABDU FARI OTHMAN AL-THAHBANI\nتاريخ الميلاد: 1963-07-14\nمكان الميلاد: اليمن\nالاسم: عادل عبده فاري عثمان الذهباني\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:56'),
(69, 'رضوان قنان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): قنان\nاسم العائلة (بالحروف اللاتينية): QANAN\nالاسم الكامل (بالحروف اللاتينية): RADWAN QANAN\nتاريخ الميلاد: 1988-01-12\nمكان الميلاد: اليمن\nالاسم: رضوان قنان\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:57'),
(70, 'والي نشوان اليافعي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): اليافعي\nاسم العائلة (بالحروف اللاتينية): AL-YAFI\'I\nالاسم الكامل (بالحروف اللاتينية): WALI NASHWAN AL-YAFI\'I\nتاريخ الميلاد: 1905-06-06\nالاسم: والي نشوان اليافعي\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:57'),
(71, 'خالد سعيد غابش العبيدي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): العبيدي\nاسم العائلة (بالحروف اللاتينية): AL-UBAYDI\nالاسم الكامل (بالحروف اللاتينية): KHALID SA\'ID GHABISH AL-UBAYDI\nتاريخ الميلاد: 1986-11-17\nمكان الميلاد: اليمن\nالاسم: خالد سعيد غابش العبيدي\nالدولة: اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:58'),
(72, 'بلال علي الوافي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nاسم العائلة (بالحروف العربية): الوافي\nاسم العائلة (بالحروف اللاتينية): AL-WAFI\nالاسم الكامل (بالحروف اللاتينية): BILAL ALI AL-WAFI\nالاسم: بلال علي الوافي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:22:59'),
(73, 'خالد ناظم دياب', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أمريكا\nاسم العائلة (بالحروف العربية): دياب\nاسم العائلة (بالحروف اللاتينية): DIAB\nالاسم الكامل (بالحروف اللاتينية): KHALID NAZEM DIAB\nالاسم: خالد ناظم دياب\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:00'),
(74, 'د.سالم جابر عمر علي سلطان فتح الله جابر', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ليبيا\nاسم العائلة (بالحروف العربية): جابر\nاسم العائلة (بالحروف اللاتينية): JABER\nالاسم الكامل (بالحروف اللاتينية): SALEM JABER OMAR ALI SULTAN FATHALLAH JABER\nالاسم: د.سالم جابر عمر علي سلطان فتح الله جابر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:00'),
(75, 'ميسر علي موسى عبدالله الجبوري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الجبوري\nاسم العائلة (بالحروف اللاتينية): AL-JUBURI\nالاسم الكامل (بالحروف اللاتينية): MAYSAR ALI MUSA ABDALLAH AL-JUBURI\nتاريخ الميلاد: 1976-05-31\nمكان الميلاد: العراق\nالاسم: ميسر علي موسى عبدالله الجبوري\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:01'),
(76, 'محمد علي سعيد أتم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nاسم العائلة (بالحروف العربية): أتم\nاسم العائلة (بالحروف اللاتينية): ATM\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED ALI SAEED ATM\nالاسم: محمد علي سعيد أتم\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:02'),
(77, 'حسن علي محمد جمعة سلطان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: البحرين\nاسم العائلة (بالحروف العربية): سلطان\nاسم العائلة (بالحروف اللاتينية): SULTAN\nالاسم الكامل (بالحروف اللاتينية): HASAN ALI MOHAMMED JUMA\'A SULTAN\nالاسم: حسن علي محمد جمعة سلطان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:02'),
(78, 'يحيى السيد إبراهيم محمد موسى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): موسى\nاسم العائلة (بالحروف اللاتينية): MOUSA\nالاسم الكامل (بالحروف اللاتينية): YAHIA AL SAYED IBRAHIM MOHAMED MOUSA\nتاريخ الميلاد: 1984-05-04\nمكان الميلاد: مصر\nالاسم: يحيى السيد إبراهيم محمد موسى\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:03'),
(79, 'محمد جمال أحمد حشمت عبدالحميد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عبدالحميد\nاسم العائلة (بالحروف اللاتينية): ABDELHAMEED\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED GAMAL AHMED HESHMAT ABDELHAMEED\nتاريخ الميلاد: 1905-05-09\nمكان الميلاد: مصر\nالاسم: محمد جمال أحمد حشمت عبدالحميد\nالدولة: تركيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:03'),
(80, 'السيد محمود عزت إبراهيم عيسى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): عيسى\nاسم العائلة (بالحروف اللاتينية): EISSA\nالاسم الكامل (بالحروف اللاتينية): ALSAYED MAHMOUD EZZAT IBRAHIM EISSA\nتاريخ الميلاد: 1905-04-27\nمكان الميلاد: مصر\nالاسم: السيد محمود عزت إبراهيم عيسى\nالدولة: مصر - مسجون\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:04'),
(81, 'قدري محمد فهمي محمود الشيخ', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): الشيخ\nاسم العائلة (بالحروف اللاتينية): AL-SHAIKH\nالاسم الكامل (بالحروف اللاتينية): QADRI MOHAMMED FAHIM MAHMOUD AL-SHAIKH\nتاريخ الميلاد: 1972-11-01\nالاسم: قدري محمد فهمي محمود الشيخ\nالمدينة: إسطنبول\nالدولة: تركيا\nالنوع: جواز سفر\nرقم الوثيقة: 618452\nجهة الإصدار: مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:05'),
(82, 'علاء علي علي محمد السماحي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: مصر\nاسم العائلة (بالحروف العربية): السماحي\nاسم العائلة (بالحروف اللاتينية): AL-SAMAHI\nالاسم الكامل (بالحروف اللاتينية): ALAA ALI ALI MOHAMMED AL-SAMAHI\nتاريخ الميلاد: 1975-12-31\nمكان الميلاد: مصر\nالاسم: علاء علي علي محمد السماحي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'شخص إرهابي', NULL, '2025-10-31 00:23:05'),
(83, 'مسعود نيكباخت', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: النمسا\nاسم العائلة (بالحروف العربية): نيكباخت\nاسم العائلة (بالحروف اللاتينية): NIKBAKHT\nالاسم الكامل (بالحروف اللاتينية): MAS\'UD NIKBAKHT\nتاريخ الميلاد: 1942-12-31\nالاسم: مسعود نيكباخت\nالنوع: تأشيرة سياحية\nرقم الوثيقة: 2042004010355827\nجهة الإصدار: دبي\nتاريخ الانتهاء: 2005-01-19\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:06'),
(84, 'سعيد نجفبور', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nاسم العائلة (بالحروف العربية): نجفبور\nاسم العائلة (بالحروف اللاتينية): NAJAFPUR\nالاسم الكامل (بالحروف اللاتينية): SA\'ID NAJAFPUR\nالاسم: سعيد نجفبور\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:06'),
(85, 'محمد حسن خوداي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): خوداي\nاسم العائلة (بالحروف اللاتينية): KHODA\'I\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD HASAN KHODA\'I\nالاسم: محمد حسن خوداي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:07'),
(86, 'محمد رضا خدمتي فلدزاجارد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): فلدزاجارد\nاسم العائلة (بالحروف اللاتينية): VALADZAGHARD\nالاسم الكامل (بالحروف اللاتينية): MOHAMMADREZA KHEDMATI VALADZAGHARD\nتاريخ الميلاد: 1986-05-03\nمكان الميلاد: ايران\nالاسم: محمد رضا خدمتي فلدزاجارد\nالنوع: جواز سفر\nرقم الوثيقة: N35635875\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:08'),
(87, 'مقداد أميني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): أميني\nاسم العائلة (بالحروف اللاتينية): AMINI\nالاسم الكامل (بالحروف اللاتينية): MEGHDAD AMINI\nتاريخ الميلاد: 1982-05-05\nمكان الميلاد: ايران\nالاسم: مقداد أميني\nالنوع: جواز سفر\nرقم الوثيقة: U36089349\nجهة الإصدار: ايران\nتاريخ الإصدار: 2015-12-23\nتاريخ الانتهاء: 2020-12-22\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:08'),
(88, 'فؤاد صالحي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): صالحي\nاسم العائلة (بالحروف اللاتينية): SALEHI\nالاسم الكامل (بالحروف اللاتينية): FOAD SALEHI\nتاريخ الميلاد: 1986-04-27\nمكان الميلاد: ايران\nالاسم: فؤاد صالحي\nالنوع: جواز سفر\nرقم الوثيقة: 25265428\nجهة الإصدار: ايران\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:09'),
(89, 'محمد إبراهيم أوهادي (جلال فهدي)', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): اوهادي\nاسم العائلة (بالحروف اللاتينية): OWHADI\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD EBRAHIM OWHADI\nتاريخ الميلاد: 1905-05-16\nالاسم: محمد إبراهيم أوهادي (جلال فهدي)\nالدولة: ايران\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:10'),
(90, 'إسماعيل ريزافي (العميد ريزافي)', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: ايران\nاسم العائلة (بالحروف العربية): زيرافي\nاسم العائلة (بالحروف اللاتينية): RAZAVI\nالاسم الكامل (بالحروف اللاتينية): ESMA\'IL RAZAVI\nتاريخ الميلاد: 1905-05-12\nالاسم: إسماعيل ريزافي (العميد ريزافي)\nالدولة: ايران\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:10'),
(91, 'عبدالله صمد فاروق (عبدالصمد)', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): فاروق\nاسم العائلة (بالحروف اللاتينية): FAROQUI\nالاسم الكامل (بالحروف اللاتينية): ABDULLAH SAMAD FAROQUI\nالاسم: عبدالله صمد فاروق (عبدالصمد)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:11'),
(92, 'محمد داود مزمل', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): مزمل\nاسم العائلة (بالحروف اللاتينية): Mzml\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD DAWOOD\nتاريخ الميلاد: 1982-12-31\nمكان الميلاد: أفغانستان\nالاسم: محمد داود مزمل\nالمدينة: شورى كويتا\nالدولة: باكستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:11'),
(93, 'عبدالرحيم منان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): منان\nاسم العائلة (بالحروف اللاتينية): MANAN\nالاسم الكامل (بالحروف اللاتينية): ABDUL RAHIM MANAN\nتاريخ الميلاد: 1961-12-31\nمكان الميلاد: أفغانستان\nالاسم: عبدالرحيم منان\nالمدينة: ولاية هلمند\nالدولة: أفغانستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:12'),
(94, 'محمد نعيم باريتش', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): باريتش\nاسم العائلة (بالحروف اللاتينية): BARICH\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD NAEEM BARICH\nتاريخ الميلاد: 1974-12-31\nمكان الميلاد: أفغانستان\nالاسم: محمد نعيم باريتش\nالشارع: هوزار قوفيت\nالمدينة: ولاية هلمند\nالدولة: أفغانستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:13'),
(95, 'سادر إبراهيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): إبراهيم\nاسم العائلة (بالحروف اللاتينية): IBRAHIM\nالاسم الكامل (بالحروف اللاتينية): SADR IBRAHIM\nتاريخ الميلاد: 1905-06-01\nمكان الميلاد: أفغانستان\nالاسم: سادر إبراهيم\nالدولة: أفغانستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:13'),
(96, 'عبدالعزيز <حاجي عزيز شاه زماني>', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: باكستان\nاسم العائلة (بالحروف العربية): زماني\nاسم العائلة (بالحروف اللاتينية): ZAMANI\nالاسم الكامل (بالحروف اللاتينية): ABDUL AZIZ SHAH ZAMANI\nتاريخ الميلاد: 1984-12-31\nمكان الميلاد: باكستان\nالاسم: عبدالعزيز <حاجي عزيز شاه زماني>\nالشارع: شارع 30\nالمدينة: كراتشي\nالدولة: باكستان\nالنوع: جواز سفر\nرقم الوثيقة: AP1810244\nجهة الإصدار: باكستان\nتاريخ الانتهاء: 2026-10-30\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:14'),
(97, 'حفيظ عبدالمجيدي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: باكستان\nاسم العائلة (بالحروف العربية): عبدالمجيدي\nاسم العائلة (بالحروف اللاتينية): ABDUL MAJEED\nالاسم الكامل (بالحروف اللاتينية): HAFEEZ ABDUL MAJEED\nتاريخ الميلاد: 1971-12-31\nمكان الميلاد: أفغانستان\nالاسم: حفيظ عبدالمجيدي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (50) لسنة 2018', 'شخص إرهابي', NULL, '2025-10-31 00:23:14'),
(98, 'عبدالرحمن علي حسين الأحمد الراوي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سوري\nاسم العائلة (بالحروف العربية): الراوي\nاسم العائلة (بالحروف اللاتينية): AL-RAWI\nالاسم الكامل (بالحروف اللاتينية): ABD-AL RAHMAN \'ALI HUSAYN AL-AHMAD AL-RAWI\nتاريخ الميلاد: 1905-06-05\nالاسم: عبدالرحمن علي حسين الأحمد الراوي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'شخص إرهابي', NULL, '2025-10-31 00:23:15'),
(99, 'سيد حبيب أحمد خان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nاسم العائلة (بالحروف العربية): خان\nاسم العائلة (بالحروف اللاتينية): KHAN\nالاسم الكامل (بالحروف اللاتينية): SAYED HABIB AHMAD KHAN\nتاريخ الميلاد: 1969-12-31\nمكان الميلاد: أفغانستان\nالاسم: سيد حبيب أحمد خان\nالنوع: جواز سفر\nرقم الوثيقة: P2502071\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'شخص إرهابي', NULL, '2025-10-31 00:23:16'),
(100, 'احمد محمد عبدالله محمد الشيبه النعيمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الامارات\nالاسم الكامل (بالحروف اللاتينية): AHMED MOHAMMED ABDULLA MOHAMMED ALSHAIBA ALNUAIMI\nمكان الميلاد: إمارة عجمان، الإمارات\nالنوع: الرقم الموحد\nرقم الوثيقة: 257451\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:16'),
(101, 'محمد صقر يوسف صقر الزعابي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الامارات\nالاسم الكامل (بالحروف اللاتينية): MOHAMED SAQER YOUSIF SAQER AL ZAABI\nمكان الميلاد: إمارة ابوظبي، الإمارات\nالنوع: الرقم الموحد\nرقم الوثيقة: 10249\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:17'),
(102, 'حمد محمد رحمه حميد الشامسي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الامارات\nالاسم الكامل (بالحروف اللاتينية): HAMAD MOHAMMED RAHMAH HUMAID ALSHAMSI\nمكان الميلاد: إمارة عجمان، الإمارات\nالنوع: الرقم الموحد\nرقم الوثيقة: 253981\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:18'),
(103, 'سعيد ناصر سعيد ناصر الطنيجي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الامارات\nالاسم الكامل (بالحروف اللاتينية): SAEED NASER SAEED NASER ALTENEIJI\nمكان الميلاد: الرمس، راس الخيمة\nالنوع: الرقم الموحد\nرقم الوثيقة: 411483\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:18'),
(104, 'حسن حسين طباجه', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: لبنان\nالاسم الكامل (بالحروف اللاتينية): HASSAN HUSSAIN TABAJA\nمكان الميلاد: لبنان\nالنوع: الرقم الموحد\nرقم الوثيقة: 58084207\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:19'),
(105, 'ادهم حسين طباجه', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: لبنان\nالاسم الكامل (بالحروف اللاتينية): ADHAM HUSSAIN TABAJA\nمكان الميلاد: لبنان\nالنوع: الرقم الموحد\nرقم الوثيقة: 5207219\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:20'),
(106, 'محمد احمد مسعد سعيد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED AHMED MUSAED SAEED\nمكان الميلاد: اليمن\nالنوع: الرقم الموحد\nرقم الوثيقة: 118618863\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:20'),
(107, 'راشد صالح صالح الجرموزى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): RASHED SALEH SALEH AL JARMOUZI\nمكان الميلاد: اليمن\nالنوع: الرقم الموحد\nرقم الوثيقة: 7000815\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:21'),
(108, 'نايف ناصر صالح الجرموزى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): NAIF NASSER SALEH ALJARMOUZI\nمكان الميلاد: اليمن\nالنوع: الرقم الموحد\nرقم الوثيقة: 76107095\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:21'),
(109, 'ذبيح الله عبدالقاهر دوراني', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: أفغانستان\nالاسم الكامل (بالحروف اللاتينية): Zubiullah Abdul Qahir Durani\nمكان الميلاد: أفغانستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:22'),
(110, 'سليمان صالح سالم عبولان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): Suliman Saleh Salem Aboulan\nمكان الميلاد: اليمن - سيئون\nالنوع: جواز سفر يمني\nرقم الوثيقة: 8890725\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:22'),
(111, 'عادل أحمد سالم عبيد علي بادره', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): Adel Ahmed Salem Obaid Ali Badrah\nمكان الميلاد: اليمن - سيئون\nالنوع: جواز سفر يمني\nرقم الوثيقة: 7772452\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:23'),
(112, 'على ناصر عسيرى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: السعودية\nالاسم الكامل (بالحروف اللاتينية): Ali Nasser Alaseeri\nمكان الميلاد: السعودية\nالنوع: جواز سفر سعودي\nرقم الوثيقة: 11879\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:24'),
(113, 'فضل صالح سالم الطيابى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): FADHL SALEH SALEM ALTAYABI\nمكان الميلاد: اليمن - البيضاء\nالنوع: جواز سفر يمني\nرقم الوثيقة: 2879473\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:25'),
(114, 'عاشور عمر عاشور عبيدون', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): Ashur Omar Ashur OBAIDOON\nمكان الميلاد: اليمن\nالنوع: جواز سفر يمني\nرقم الوثيقة: 7777531\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:25'),
(115, 'حازم محسن الفرحان + حازم محسن فرحان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سوري\nالاسم الكامل (بالحروف اللاتينية): HAZEM MOHSEN FARHAN + HAZEM MOHSEN AL FARHAN\nمكان الميلاد: سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 73739119\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:26'),
(116, 'مهدى عزيز اله كياستى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nالاسم الكامل (بالحروف اللاتينية): MEHDI AZIZOLLAH KIASATI\nمكان الميلاد: إيران\nالنوع: الرقم الموحد\nرقم الوثيقة: 143729561\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:27'),
(117, 'فرشاد جعفر حاكم زاده', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nالاسم الكامل (بالحروف اللاتينية): FARSHAD JAFAR HAKEMZADEH\nمكان الميلاد: إيران\nالنوع: الرقم الموحد\nرقم الوثيقة: 117728897\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:27'),
(118, 'سيد رضا سيد محمد قاسمى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nالاسم الكامل (بالحروف اللاتينية): SEYYED REZA MOHMMAD GHASEMI\nمكان الميلاد: إيران\nالنوع: الرقم الموحد\nرقم الوثيقة: 67981903\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:28'),
(119, 'محسن حسن كاركرحجت', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nالاسم الكامل (بالحروف اللاتينية): ((MOHSEN HASSAN KARGARHODJAT ABADI\nمكان الميلاد: إيران\nالنوع: الرقم الموحد\nرقم الوثيقة: 46809739\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:28'),
(120, 'ابراهيم محمود احمد محمد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: إيراني\nالاسم الكامل (بالحروف اللاتينية): IBRAHIM MAHMOOD AHMED MOHAMMED\nمكان الميلاد: إمارة عجمان، الإمارات\nالنوع: الرقم الموحد\nرقم الوثيقة: 261216\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:29'),
(121, 'اسامه حسين دغيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سوريا\nالاسم الكامل (بالحروف اللاتينية): OSAMA HOUSEN DUGHAEM\nمكان الميلاد: سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 39396225\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:29');
INSERT INTO `goaml` (`id`, `name`, `phone`, `status`, `note`, `type`, `created_by`, `created_at`) VALUES
(122, 'عبدالرحمن أدو موسى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): ABDURRAHAMAN ADO MUSA\nمكان الميلاد: ياكاساي نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 170211735\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:30'),
(123, 'صالح يوسف أدامو', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): SALIHU YUSUF ADAMU\nمكان الميلاد: كانو نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 119145993\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:31'),
(124, 'بشير علي يوسف', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): BASHIR ALI YUSUF\nمكان الميلاد: كانو نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 154101359\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:31'),
(125, 'محمد إبراهيم عيسى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): MUHAMMED IBRAHIM ISA\nمكان الميلاد: كانو نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 47171720\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:32'),
(126, 'إبراهيم علي الحسن', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): IBRAHIM ALI ALHASSAN\nمكان الميلاد: كانو نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 39624466\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:33'),
(127, 'سوراجو أبوبكر محمد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: نيجيري\nالاسم الكامل (بالحروف اللاتينية): SURAJO ABUBAKAR MUHAMMAD\nمكان الميلاد: ريمي نيجيريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 175020687\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:33'),
(128, 'علاء خنفورة أو علاء عبدالرزاق علي خنفورة أو علاء الخنفورة', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سوري\nالاسم الكامل (بالحروف اللاتينية): Alaa khanfurah - Alaa abdulrazzaq ali khanfurah - Alaa Alkhanfurah\nمكان الميلاد: سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:34'),
(129, 'فادي سعيد كمار، فادي سعيد قمر', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: بريطانيا\nالاسم الكامل (بالحروف اللاتينية): FADI SAID KAMAR\nمكان الميلاد: دمشق - سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 100038025\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:35'),
(130, 'وليد كامل عوض', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سانت كيتس - نافيس\nالاسم الكامل (بالحروف اللاتينية): WALID KAMEL AWAD\nمكان الميلاد: دمشق - سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 30797785\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:35'),
(131, 'خالد وليد عوض', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: سانت كيتس - نافيس\nالاسم الكامل (بالحروف اللاتينية): KHALED WALID AWAD\nمكان الميلاد: دمشق - سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 112338165\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:36'),
(132, 'عماد خالق كونداكزى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: روسيا\nالاسم الكامل (بالحروف اللاتينية): IMAD KHALLAK KANTAKDZHI\nمكان الميلاد: سوريا\nالنوع: الرقم الموحد\nرقم الوثيقة: 122879693\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:36'),
(133, 'محمد ايمن تيسير رشيد المراياتى', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الأردن\nالاسم الكامل (بالحروف اللاتينية): MOUHAMMAD AYMAN TAYSEER RASHID MARAYAT\nمكان الميلاد: الأردن\nالنوع: الرقم الموحد\nرقم الوثيقة: 33652035\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'شخص إرهابي', NULL, '2025-10-31 00:23:37'),
(134, 'حسن أحمد مقلد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: لبنان\nاسم العائلة (بالحروف العربية): مقلد\nاسم العائلة (بالحروف اللاتينية): Moukalled\nالاسم الكامل (بالحروف اللاتينية): Hassan Ahmed Moukalled\nتاريخ الميلاد: 17/02/1967\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (9) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:23:38'),
(135, 'راني حسن مقلد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: لبنان\nاسم العائلة (بالحروف العربية): مقلد\nاسم العائلة (بالحروف اللاتينية): Moukalled\nالاسم الكامل (بالحروف اللاتينية): Rani Hassan Moukalled\nتاريخ الميلاد: 29/10/1998\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (9) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:23:38'),
(136, 'ريان حسن مقلد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: لبنان\nاسم العائلة (بالحروف العربية): مقلد\nاسم العائلة (بالحروف اللاتينية): Moukalled\nالاسم الكامل (بالحروف اللاتينية): Ryyan Hassan Moukalled\nتاريخ الميلاد: 25/10/1993\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (9) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:23:39'),
(137, 'يوسف حسن أحمد الملا', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الحالية: السويد السابقة: ليبيريا\nالاسم الكامل (بالحروف اللاتينية): YOUSEF HASSAN AHMAD AL MULLA\nتاريخ الميلاد: 1984-01-06\nمكان الميلاد: الشارقة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 146957\nجهة الإصدار: ليبيريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:39'),
(138, 'سعيد خادم أحمد بن طوق المري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: تركيا\nالاسم الكامل (بالحروف اللاتينية): SAEED KHADEM AHMED BINTOUQ ALMARRI\nتاريخ الميلاد: 1960-01-03\nمكان الميلاد: دبي - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: تركي رقم: U24171753 إماراتي رقم: NZ9Y56591\nجهة الإصدار: تركيا و الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:40'),
(139, 'إبراهيم أحمد إبراهيم علي الحمادي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): IBRAHIM AHMED IBRAHIM ALI ALHAMMADI\nتاريخ الميلاد: 1957-12-31\nمكان الميلاد: الفجيرة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: السويد رقم: 35482622 إماراتي رقم: A2649673\nجهة الإصدار: السويد و الامارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:41'),
(140, 'إلهام عبدالله أحمد الهاشمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: السويد\nالاسم الكامل (بالحروف اللاتينية): ELHAM ABDULLA AHMAD ALHASHEMI\nتاريخ الميلاد: 20/12/1963\nمكان الميلاد: دبي - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: A2569896\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:41'),
(141, 'جاسم راشد خلفان راشد الشامسي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): JASEM RASHED KHALFAN RASHED ALSHAMSI\nتاريخ الميلاد: 30/12/1968\nمكان الميلاد: الشارقة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 2106900\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:42'),
(142, 'خالد عبيد يوسف بوعتابه الزعابي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): KHALID OBAID YOUSIF BUATABA ALZAABI\nتاريخ الميلاد: 19/06/1989\nمكان الميلاد: أبوظبي - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: C47F92116\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:43'),
(143, 'عبدالرحمن حسن منيف عبدالله حسن الجابري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): ABDUL RAHMAN HASAN MUNIF A. ALJABERI\nتاريخ الميلاد: 20/05/1989\nمكان الميلاد: أبوظبي - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 2454612\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:43'),
(144, 'حميد عبدالله عبدالرحمن الجرمن النعيمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): HUMAID ABDULLA ABDULRAHMAN J. ALNUAIMI\nتاريخ الميلاد: 1974-09-07\nمكان الميلاد: دبي - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 2535370\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:44'),
(145, 'عبدالرحمن عمر سالم باجبير الحضرمي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): ABDELRAHMAN OMAR SALIM BAJUBAIR ALHADHRAMI\nتاريخ الميلاد: 27/02/1987\nمكان الميلاد: الشارقة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: إماراتي رقم: FNJR81768 بريطاني رقم: 760001649\nجهة الإصدار: الإمارات و بريطانيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:44'),
(146, 'علي حسن علي حسين الحمادي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الإمارات\nالاسم الكامل (بالحروف اللاتينية): ALI HASAN ALI HUSAIN ALHAMMADI\nتاريخ الميلاد: 1958-12-31\nمكان الميلاد: الشارقة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 2363886\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:45'),
(147, 'محمد علي حسن علي الحمادي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): MOHAMED ALI HASSAN ALI ALHAMMADI\nتاريخ الميلاد: 1982-04-30\nمكان الميلاد: الشارقة - الإمارات\nالنوع: جواز السفر\nرقم الوثيقة: 2333890\nجهة الإصدار: الإمارات\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:46'),
(148, 'حسن أبشر حور', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Hasaan Abshir Xuuroow\nتاريخ الميلاد: 1905-06-05\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:46'),
(149, 'أدن يوسف سعيد إبراهيم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Aadan Yusuf Saciid Ibrahim\nتاريخ الميلاد: 1905-06-10\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:47'),
(150, 'مؤمن ديري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Mumin Dheere\nتاريخ الميلاد: 1905-06-07\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:47'),
(151, 'ماكالين برهان', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Macalin Burhan\nتاريخ الميلاد: 1905-06-04\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:48'),
(152, 'علي أحمد حسين', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Ali Ahmed Hussein\nتاريخ الميلاد: 1905-06-02\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:48'),
(153, 'مكسمات كالي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Maxamed Cali\nتاريخ الميلاد: 1905-06-06\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:49'),
(154, 'أحمد كبادي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Ahmed Kabadhe\nتاريخ الميلاد: 1905-06-01\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:49'),
(155, 'سيات أيوتو', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Siyaat Ayuto\nتاريخ الميلاد: 1905-06-04\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:50'),
(156, 'حسن ياريسو آدم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Hassan Yariisow Aadan\nتاريخ الميلاد: 1905-06-12\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:51'),
(157, 'سعيد عبدالله آدم', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Siciid Abdullahi Aadan\nتاريخ الميلاد: 1905-06-20\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:51'),
(158, 'محمد عبدالله حيري', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Mohamed Abdullah Hirey\nتاريخ الميلاد: 1905-05-07\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:52'),
(159, 'كبدي روبوي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Cabdi Roobow\nتاريخ الميلاد: 1905-06-03\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:52'),
(160, 'شيخ آدم أبوبكر ماليلي', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Shiek Aadan Abuukar Malayle\nتاريخ الميلاد: 1905-05-15\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:53'),
(161, 'آدم جيس', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Aadan Jiss\nتاريخ الميلاد: 1905-05-30\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:54'),
(162, 'كومار قوهاد', NULL, 'compliant', 'مصدر القائمة: الأفراد\nالتصنيف: شخص إرهابي\nالجنسية: الصومال\nالاسم الكامل (بالحروف اللاتينية): Cumar Guhaad\nتاريخ الميلاد: 1905-05-25\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (44) لسنة 2025', 'شخص إرهابي', NULL, '2025-10-31 00:23:54'),
(163, 'MUSLIM BROTHERHOOD IN THE UAE', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة الإخوان المسلمين الإماراتية دعوة الإصلاح (جمعية الإصلاح)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:55'),
(164, 'KHALAYA AL JIHAD AL-EMIRATI (UAE JAHADIST CELLS)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: خلايا الجهاد الإماراتي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:55'),
(165, 'OMMAH PARTY', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: أحزاب الأمة في الخليج\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:56'),
(166, 'AL QAEDA (AQ)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: تنظيم القاعدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:56'),
(167, 'ISLAMIC STATE OF IRAQ AND THE LEVANT (ISIS)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: الدولة الإسلامية في العراق والشام (داعش)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:57'),
(168, 'AL-QA\'IDA IN THE ARABIAN PENINSULA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: تنظيم القاعدة في شبه الجزيرة العربية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:58'),
(169, 'ANSAR AL-SHARIA(SUPPORTERS OF SHARIA LAW ) IN YEMEN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: أنصار الشريعة (اليمن)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:58'),
(170, 'THE MUSLIM BROTHERHOOD', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: تنظيم وجماعة الإخوان المسلمين\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:23:59'),
(171, 'ISLAMIC GROUB IN EGYPT', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: الجماعة الإسلامية في مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:00'),
(172, 'ANSAR BAIT AL-MAQDIS (WILAYAT SINAI- PROVINCE OR STATE IN THE SINAI)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة أنصار بيت المقدس المصرية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:00'),
(173, 'AJNAD MISR', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة أجناد مصر\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:01'),
(174, 'MAJLIS SHURA AL-MUJAHIDEEN FI AKNAF BAYT AL-MAQDIS (THE MUJAHEDEEN SHURA COUNCIL IN THE ENVIRONS OF JERUSALEM)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: مجلس شورى المجاهدين أكناف بيت المقدس\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:01'),
(175, 'THE HOUTHI MOVEMENT IN YEMEN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة الحوثيين في اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:02'),
(176, 'HEZBOLLAH AL-HIJAZ IN SAUDI ARABIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حزب الله السعودي في الحجاز\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:03'),
(177, 'HEZBOLLAH IN THE GULF COOPERATION COUNCIL', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حزب الله في دول مجلس التعاون الخليجي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:03'),
(178, 'AL-QAIDA ORGNAISATION IN IRAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: تنظيم القاعدة في إيران\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:04'),
(179, 'BADER ORGANISATION IN IRAQ', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: منظمة بدر في العراق\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:04'),
(180, 'ASAAIB AHL AL-HAQ (LEAGUE OF THE RIGHTEOUS) IN IRAQ', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: عصائب أهل الحق في العراق\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:05'),
(181, 'HEZBOLLAH BRIGADE IN IRAQ', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتائب حزب الله (العراق)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:05'),
(182, 'LIWA ABU AL-FADL AL-ABBAS IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: لواء أبو فضل العباس في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:06'),
(183, 'AL-YOUM AL-MAOUD BRIGADE IN IRAQ', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتائب لواء اليوم الموعود (العراق)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:07'),
(184, 'OMAR BIN YASSER BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: لواء عمر بن ياسر (سوريا)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:07'),
(185, 'ANSAR AL-ISLAM', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة أنصار الإسلام العراقية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:08'),
(186, 'AL-NUSRAH FRONT IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جبهة النصرة في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:08'),
(187, 'HARAKET AHRAR ASHAM IN SYRIA (ISLAMIC MOVEMENT OF THE FREE MAN OF THE LEVENT)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة أحرار الشام في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:09'),
(188, 'THE ARMY OF ISLAM IN PALESTINE', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جيش الإسلام في فلسطين\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:09'),
(189, 'ABDALLAH AZZAM BRIGADES', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتائب عبد الله عزام\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:10'),
(190, 'FATAH AL ISLAM IN LEBANON', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة فتح الإسلام اللبنانية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:11'),
(191, 'ASBAT AL-ANSAR IN LEBANON', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: عصبة الأنصار في لبنان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:11'),
(192, 'AL QAIDA IN THE LAND OF THE ISLAMIC MAGHREB', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: تنظيم القاعدة في بلاد المغرب الإسلامي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:12'),
(193, 'ANSAR AL-SHARIA IN LIBYA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة أنصار الشريعة في ليبيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:13'),
(194, 'ANSAR AL-SHARI\'A IN TUNISIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة أنصار الشريعة في تونس\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:13'),
(195, 'MUJAHIDEEN YOUTH MOVEMENT IN SOMALIA(HARAKET AL-SHABAAB AL-MUJAHIDEEN IN SOMALIA)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة شباب المجاهدين الصومالية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:14'),
(196, 'BOKO HARAM IN NIGERIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة بوكو حرام في نيجيريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:14'),
(197, 'ALMOURABITOUN GROUB IN MALI(THE SENTINELS)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة المرابطون في مالي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:15'),
(198, 'ANSAR AL-DINE IN MALI', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة أنصار الدين في مالي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:16'),
(199, 'THE HAQQANI NETWORK IN PAKISTAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: شبكة حقاني الباكستانية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:16'),
(200, 'LASHKAR E-TAYYIBA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة لشكر طيبة الباكستانية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:17'),
(201, 'EAST TURKISTAN MOVEMENT IN PAKISTAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة تركستان الشرقية في باكستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:17'),
(202, 'JAISH-I-MOHAMMED IN PAKISTAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جيش محمد في باكستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:18'),
(203, 'JAISH-E-MOHAMMED (THE ARMY OF MOHAMMAD IN PAKISTAN AND INDIA)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جيش محمد في باكستان والهند\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:19'),
(204, 'AL-MUJAHIDEEN AL-HONOUD IN KASHMIR/INDIA (THE INDIAN MUJAHIDEEN)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: المجاهدين الهنود في الهند/ كشمير\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:19'),
(205, 'CAUCASUS EMIRATE', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: إمارة القوقاز الإسلامية (الجهاديين الشيشانيين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:20'),
(206, 'THE ISLAMIC MOVEMENT OF UZBEKISTAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: الحركة الإسلامية الأوزبكية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:21'),
(207, 'ABU SAYYAF GROUP', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: جماعة أبوسياف الفلبينية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:22'),
(208, 'TAHRIK-E TALIBAN PAKISTAN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة طالبان باكستان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:22'),
(209, 'ABU-DHAR AL-GHIFARI BATTALION IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة أبو ذر الغفاري في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:23'),
(210, 'AL-TAWHEED BRIGADE IN SYRIA(BRIGADE OF UNITY,OR MONOTHEISM)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: لواء التوحيد في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:23'),
(211, 'AL-TAWHID WAL-EMAN BATTALION IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة التوحيد والإيمان في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:24'),
(212, 'KATIBAT AL-KHADRA IN SYRIA(THE GREEN BATTALTION)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة الخضراء في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:25'),
(213, 'ABU BAKR AL-SIDDIQ BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرية أبو بكر الصديق في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:25'),
(214, 'TALHA BIN OBAIDULLAH BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرية طلحة بن عبيد الله في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:26'),
(215, 'AL-SARIM AL-BATTAR BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرية الصارم البتار في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:27'),
(216, 'ABDULLAH IBN MUBARAK BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة عبد الله بن مبارك في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:27'),
(217, 'CONVOYS OF MARTYRS BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة قوافل الشهداء في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:28'),
(218, 'ABU-OMER BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة أبو عمر في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:28'),
(219, 'AHRAR SHAMMAR BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة أحرار شمر في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:29'),
(220, 'SARIYAT AL-JABAL BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة سارية الجبل في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:29'),
(221, 'AL-SHAHBA BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة الشهباء في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:30'),
(222, 'ALQAQAA BRIGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة القعقاع في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:30'),
(223, 'SUFIAN AL-THAWRI BRGADE IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة سفيان الثوري في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:31'),
(224, 'EBAD AL-RAHMAN BRIGADE IN SYRIA(BRIGADE OF SOLDIERS OF ALLAH)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة عباد الرحمن في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:32'),
(225, 'OMAR IBN AL-KHATTAB BATTALION IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة عمر بن الخطاب في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:32'),
(226, 'AL-SHAYMA BATTALTION IN SYRIA', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة الشيماء في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:33'),
(227, 'KATIBAT AL-HAQ IN SYRIA (BRIGADE OF THE RIGHTEOUS)', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة الحق في سوريا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:33'),
(228, 'BENGHAZI DEFENSE BRIGADES', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرايا الدفاع عن بنغازي (ليبيا)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:34'),
(229, 'AL-ASHTAR BRIGADES', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرايا الأشتر (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:34'),
(230, 'FEBRUARY 14 COALITION', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: إتلاف 14 فبراير (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:35'),
(231, 'THE POPULAR RESISTANCE BRIGADES IN BAHRAIN', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرايا المقاومة (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:36'),
(232, 'BAHRAINS HEZBOLLAH', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حزب الله البحريني (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:36'),
(233, 'SARAYA AL-MUKHTAR', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: سرايا المختار (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:37'),
(234, 'BAHRAIN FREEDOM MOVEMENT', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: حركة أحرار البحرين (البحرين)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:37'),
(235, 'BENGHAZI REVOLUTIONARIES SHURA COUNCIL', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: مجلس شورى ثوار بنغازي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:38'),
(236, 'AL-SARAYA MEDIA CENTER', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: مركز السرايا للإعلام\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:38'),
(237, 'RAFALLAH AL-SAHATI BRIGADE', NULL, 'compliant', 'مصدر القائمة: التنظيمات\nالتصنيف: تنظيم إرهابي\nالاسم: كتيبة راف الله السحاتي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'تنظيم إرهابي', NULL, '2025-10-31 00:24:39'),
(238, 'AL-KARAMA ORGANISATION', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: منظمة الكرامة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:39'),
(239, 'THE COUNCIL ON AMERICAN ISLAMIC RELATIONS (CAIR)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: مجلس العلاقات الأمريكية الإسلامية (كير)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:40'),
(240, 'MUSLIM AMERICAN SOCIETY (MAS)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الجمعية الإسلامية الأمريكية (ماس)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:40'),
(241, 'INTERNAIONAL UNION OF MUSLIM SCHOLARS (IUMS)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: اتحاد علماء المسلمين\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:41'),
(242, 'FADERATION OF ISLAMIC ORGANISATION IN EUROPE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: اتحاد المنظمات الإسلامية في أوروبا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:42'),
(243, 'UNION OF ISLAMIC ORGANISATION OF FRANCE (UOIF)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: اتحاد المنظمات الإسلامية في فرنسا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:42'),
(244, 'MUSLIM ASSOCIATION OF BRITAIN (MAB)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في بريطانيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:43'),
(245, 'ISLAMIC COMMUNITY OF GERMANY', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: التجمع الإسلامي بألمانيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:43'),
(246, 'ISLAMIC ASSOCIATION OF DENMARK', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في الدنمارك\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:44'),
(247, 'ISLAMIC ASSOCIATION IN BELGIUM', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في بلجيكا (رابطة مسلمي بلجيكا)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:45'),
(248, 'ISAMIC ASSOCIATION OF ITALY', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في إيطاليا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:45'),
(249, 'ISLAMIC ASSOCIATION OF FINLAND', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في فنلندا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:46'),
(250, 'ISLAMIC ASSOCIATION OF SWEDEN', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في السويد\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:46'),
(251, 'ISLAMIC ASSOCIATION OF NORWAY', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الرابطة الإسلامية في النرويج\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:47'),
(252, 'ISLAMIC AID', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: منظمة الإغاثة الإسلامية في لندن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:47'),
(253, 'THE CORDOBA FOUNDATION', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة قرطبة في بريطانيا\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:48'),
(254, 'ISLAMIC RELETIEF WORLD WIDE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: هيئة الإغاثة الإسلامية التابعة لتنظيم الإخوان المسلمين الدولي\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014', 'كيان إرهابي', NULL, '2025-10-31 00:24:49'),
(255, 'ALRAHMA FOUNDATION FOR HUMAN DEVELOPMENT', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة الرحمة الخيرية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:49'),
(256, 'BOSHRA NEWS AGENCY', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: وكالة بشرى الإخبارية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:50'),
(257, 'ALNABAA TV', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: قناة النبأ\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:50'),
(258, 'TANASUH FOUNDATION FOR DAWA,CULTURE AND MEDIA', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة التناصح للدعوة والثقافة والإعلام\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:51'),
(259, 'AL KHAYR SUPERMARKET', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: سوبر ماركت الخير\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (45) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:51'),
(260, 'INTERNATIONAL ISLAMIC COUNCIL', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: المجلس الإسلامي العالمي \"مساع\"\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:52'),
(261, 'INTERNATIONAL UNION OF MUSLIMS SCHOLARS', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: الاتحاد العالمي لعلماء المسلمين\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017', 'كيان إرهابي', NULL, '2025-10-31 00:24:52'),
(262, 'RASHED EXCHANGE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: راشد للصرافة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'كيان إرهابي', NULL, '2025-10-31 00:24:53'),
(263, 'JAHAN ARAS KISH', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: جهان أراس كيش\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'كيان إرهابي', NULL, '2025-10-31 00:24:53'),
(264, 'KHEDMATI AND COMPANY JOINT PARTNERSHIP', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: خدمتي وشركاؤه\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (24) لسنة 2018', 'كيان إرهابي', NULL, '2025-10-31 00:24:54'),
(265, 'TAWASUL COMPANY', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: شركة تواصل\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'كيان إرهابي', NULL, '2025-10-31 00:24:54'),
(266, 'AL HARAM EXCHANGE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: شركة الهرم الصرافة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'كيان إرهابي', NULL, '2025-10-31 00:24:55'),
(267, 'AL KHALIDI EXCHANGE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: شركة الخالدي للصرافة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'كيان إرهابي', NULL, '2025-10-31 00:24:56'),
(268, 'NEJAAT SOCIAL WALFARE ORGANIZATION (NEJAAT)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: منظمة نجاة للرعاية الاجتماعية\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (51) لسنة 2020', 'كيان إرهابي', NULL, '2025-10-31 00:24:56'),
(269, 'شركة اثار الأشعة للتجارة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): RAY TRACING TRADING CO LLC\nرقم الرخصة: 576485\nانتهاء الترخيص: 2018-12-25\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:24:57'),
(270, 'شركة م ح الحمرية ارزو الدولية م م ح', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): H F Z A ARZOO INTERNATIONAL F Z E\nرقم الرخصة: 1235\nانتهاء الترخيص: 2021-06-13\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:24:58'),
(271, 'شركة حنان للملاحة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): HANAN SHIPPING L.L.C\nرقم الرخصة: 246003\nانتهاء الترخيص: 2022-04-03\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:24:58'),
(272, 'شركة فور كورنرز بتروليوم', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): FOUR CORNERS TRADING EST\nرقم الرخصة: 208202\nانتهاء الترخيص: 2021-03-14\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:24:59'),
(273, 'شركة ساسكو لوجستيك', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): SASCO LOGISTIC L.L.C\nرقم الرخصة: 535215\nانتهاء الترخيص: 2021-06-22\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:00'),
(274, 'شركة الجرموزي للتجارة العامة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): ALJARMOUZI GENERAL TRADING LLC\nرقم الرخصة: 525824\nانتهاء الترخيص: 2021-04-20\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:00'),
(275, 'شركة الجرموزي للشحن والتخليص (ش.ذ.م.م)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): AL JARMOOZI CARGO & CLEARING (L.L.C)\nرقم الرخصة: 546318\nانتهاء الترخيص: 2021-06-19\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:01'),
(276, 'شركة الجرموزي لنقل المواد بالشاحنات الثقيلة والخفيفة (ش.ذ.م.م)', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): AL JARMOOZI TRANSPORT BY HEAVY & LIGHT TRUCKS (L.L.C\nرقم الرخصة: 618449\nانتهاء الترخيص: 2021-01-10\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:01'),
(277, 'شركة ناصر الجرموزي للتجارة العامة (ش.ذ.م.م)،', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): NASER ALJARMOUZI CENERAL TRADING (L.L.C)\nرقم الرخصة: 641142\nانتهاء الترخيص: 2021-06-18\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:02'),
(278, 'شركة ناصر الجرموزي للشحن والتخليص ش ذ م م', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): NASER ALJARMOUZI CARGO & CLEARING LLC\nرقم الرخصة: 644103\nانتهاء الترخيص: 2021-08-29\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:03'),
(279, 'ويف تك للكمبيوتر ذ م م', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): WAVE TECH COMPUTER LLC\nرقم الرخصة: 117826\nانتهاء الترخيص: 2021-04-29\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:03'),
(280, 'ان واي بي أي تريدينج- م م ح', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): NYBI TRADING - FZE\nرقم الرخصة: 13045\nانتهاء الترخيص: 2017-12-19\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:04'),
(281, 'كى سى ال جنرال تريدنج م م ح', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): KCL GENERAL TRADING F Z E\nرقم الرخصة: 9639\nانتهاء الترخيص: 2017-12-20\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:05'),
(282, 'مجموعة الانماء', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): Alinma group\nرقم الرخصة: خارج الدولة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:05'),
(283, 'شركة العمقي وإخوانه للصرافة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): AL-OMGY & BROS MONEY EXCHANGE\nرقم الرخصة: خارج الدولة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021', 'كيان إرهابي', NULL, '2025-10-31 00:25:06'),
(284, 'العالمیة إکسبرس للصرافة والتحویلات المالیة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): AlAlameya Express Company for Exchange & Remittance\nالمقر: صنعاء - اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022', 'كيان إرهابي', NULL, '2025-10-31 00:25:06'),
(285, 'شرکة الحظاء للصرافة', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): Al Hadha Exchange Co\nالمقر: صنعاء - اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022', 'كيان إرهابي', NULL, '2025-10-31 00:25:07'),
(286, 'معاذ عبدالله دائل للإستيراد و التصدير', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): MOAZ ABDULLA DAEL FOR IMPORT AND EXPORT\nالمقر: صنعاء - اليمن\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022', 'كيان إرهابي', NULL, '2025-10-31 00:25:07'),
(287, 'بیریدوت للتجارة والشحن ذ م م', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): PERIDOT SHIPPING AND TRADING LLC\nالمقر: الهند\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022', 'كيان إرهابي', NULL, '2025-10-31 00:25:08'),
(288, 'لايت مون', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم الكامل (بالحروف اللاتينية): LIGHT MOON\nملاحظات: (IMO 9109550)\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022', 'كيان إرهابي', NULL, '2025-10-31 00:25:09'),
(289, 'CTEX EXCHANGE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nرقم الرخصة: 2061281 - لبنان\nالمقر: لبنان\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (9) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:09'),
(290, 'CAMBRIDGE EDUCATION AND TRAINING CENTER LTD', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: أحمد محمد عبدالله محمد الشيبة النعيمي\nرقم الرخصة: 8961546\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:10'),
(291, 'IMA6INE LTD', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nرقم الرخصة: 9881248\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:10'),
(292, 'WEMBLEY TREE LTD', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nرقم الرخصة: 15167935\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:11'),
(293, 'WASLAFORALL', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: عائشة احمد محمد الشيبة النعيمي\nرقم الرخصة: 11617032\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:12'),
(294, 'FUTURE GRADUATES LTD', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: محمد صقر يوسف صقر الزعابي\nرقم الرخصة: 9448340\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:12'),
(295, 'YAS FOR INVESTMENT AND REAL ESTATE', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nالاسم: عبدالرحمن حسن منيف عبدالله حسن الجابري\nرقم الرخصة: 10720363\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:13'),
(296, 'HOLDCO UK PROPERTIES LIMITED', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nرقم الرخصة: 15745822\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:14');
INSERT INTO `goaml` (`id`, `name`, `phone`, `status`, `note`, `type`, `created_by`, `created_at`) VALUES
(297, 'NAFEL CAPITAL', NULL, 'compliant', 'مصدر القائمة: الكيانات\nالتصنيف: كيان إرهابي\nرقم الرخصة: 15672268\nالمقر: المملكة المتحدة\nمعلومات أخرى: مدرج بموجب قرار مجلس الوزراء رقم (1) لسنة 2025', 'كيان إرهابي', NULL, '2025-10-31 00:25:14'),
(298, 'محمد سعيد بن حلوان السقطري', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): السقطري\nاسم العائلة (بالحروف اللاتينية): AL-SEQATRI\nالاسم الكامل (بالحروف اللاتينية): MOHAMMAD SAEED BIN HELWAN AL-SEQATRI\nالاسم: محمد سعيد بن حلوان السقطري\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:15'),
(299, 'خليفة بن محمد الربان', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الربان\nاسم العائلة (بالحروف اللاتينية): AL-RABBAN\nالاسم الكامل (بالحروف اللاتينية): KHALIFA BIN MOHAMMAD AL-RABBAN\nتاريخ الميلاد: 1905-05-12\nالاسم: خليفة بن محمد الربان\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:15'),
(300, 'عبد الله بن خالد حمد بن عبد الله آل ثاني', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): آل ثاني\nاسم العائلة (بالحروف اللاتينية): AL-THANI\nالاسم الكامل (بالحروف اللاتينية): ABDULLAH BIN KHALID BIN HAMAD BIN ABDULLAH AL-THANI\nتاريخ الميلاد: 1905-05-09\nالاسم: عبد الله بن خالد حمد بن عبد الله آل ثاني\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:16'),
(301, 'عبد الرحيم أحمد الحرام', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الحرام\nاسم العائلة (بالحروف اللاتينية): AL-HARAM\nالاسم الكامل (بالحروف اللاتينية): ABDUL RAHIM AHMAD AL-HARAM\nالاسم: عبد الرحيم أحمد الحرام\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:17'),
(302, 'مبارك بن محمد العجي', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): العجي\nاسم العائلة (بالحروف اللاتينية): AL-AJJI\nالاسم الكامل (بالحروف اللاتينية): MUBARAK MOHAMMAD AL-AJJI\nالاسم: مبارك بن محمد العجي\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:17'),
(303, 'جابر بن ناصر المري', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): المري\nاسم العائلة (بالحروف اللاتينية): AL-MARRI\nالاسم الكامل (بالحروف اللاتينية): JABIR BIN NASSER AL-MARRI\nالاسم: جابر بن ناصر المري\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:18'),
(304, 'محمد جاسم السليطي', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): السليطي\nاسم العائلة (بالحروف اللاتينية): AL-SULAITI\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED JASSIM AL-SULAITI\nالاسم: محمد جاسم السليطي\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:18'),
(305, 'علي بن عبد الله السويدي', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): السويدي\nاسم العائلة (بالحروف اللاتينية): AL-SUWAIDI\nالاسم الكامل (بالحروف اللاتينية): ALI BIN ABDALLAH AL-SUWAIDI\nالاسم: علي بن عبد الله السويدي\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:19'),
(306, 'هاشم محمد صالح عبد الله العوضي', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): العوضي\nاسم العائلة (بالحروف اللاتينية): AL-AWADHY\nالاسم الكامل (بالحروف اللاتينية): HASHIM SALEH ABDULLAH AL-AWADHY\nالاسم: هاشم محمد صالح عبد الله العوضي\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:20'),
(307, 'حمد عبد الله الفطيس المري', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): المري\nاسم العائلة (بالحروف اللاتينية): AL-MARRI\nالاسم الكامل (بالحروف اللاتينية): HAMAD ABDULLAH AL-FUTTAIS AL-MARRI\nالاسم: حمد عبد الله الفطيس المري\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:20'),
(308, 'خالد سعيد فضل راشد الرومي البوعينين', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): البوعينين\nاسم العائلة (بالحروف اللاتينية): AL-BOUNEIN\nالاسم الكامل (بالحروف اللاتينية): KHALID SAEED AL-BOUNEIN\nتاريخ الميلاد: 1967-12-31\nالاسم: خالد سعيد فضل راشد الرومي البوعينين\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:21'),
(309, 'شقر جمعة الشهواني', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الشهواني\nاسم العائلة (بالحروف اللاتينية): AL-SHAHWANI\nالاسم الكامل (بالحروف اللاتينية): SHAQER JUMMAH AL-SHAHWANI\nالاسم: شقر جمعة الشهواني\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:22'),
(310, 'صالح بن أحمد الغانم الكواري', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الكواري\nاسم العائلة (بالحروف اللاتينية): AL-KUWARI\nالاسم الكامل (بالحروف اللاتينية): SALEH BIN AHMED AL-GHANIM AL-KUWARI\nالاسم: صالح بن أحمد الغانم الكواري\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:22'),
(311, 'محمد سليمان حيدر محمد الحيدر', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: قطر\nاسم العائلة (بالحروف العربية): الحيدر\nاسم العائلة (بالحروف اللاتينية): AL-HAYDAR\nالاسم الكامل (بالحروف اللاتينية): MOHAMMED SULAIMAN HAIDAR MOHAMMED AL-HAYDAR\nتاريخ الميلاد: 1955-12-31\nمكان الميلاد: قطر\nالاسم: محمد سليمان حيدر محمد الحيدر\nالنوع: جواز سفر\nرقم الوثيقة: 01030941\nجهة الإصدار: قطر\nتاريخ الإصدار: 26/03/2012\nتاريخ الانتهاء: 2017-03-24\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (53) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:23'),
(312, 'حيدر حبيب على', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: العراق\nالاسم الكامل (بالحروف اللاتينية): HAYDER HABEEB ALI\nمكان الميلاد: العراق\nالنوع: الرقم الموحد\nرقم الوثيقة: 3899559\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:24'),
(313, 'باسم يوسف حسين الشغانبى', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: العراق\nالاسم الكامل (بالحروف اللاتينية): BASIM YOUSUF HUSSEIN ALSHAGHANBI\nمكان الميلاد: العراق\nالنوع: الرقم الموحد\nرقم الوثيقة: 44907857\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:24'),
(314, 'شريف احمد شريف باعلوى', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): SHARIF AHMED SHARIF BA ALAWI\nمكان الميلاد: اليمن\nالنوع: الرقم الموحد\nرقم الوثيقة: 43260201\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'شخص إرهابي', NULL, '2025-10-31 00:25:25'),
(315, 'مانوج ساباروال او براكاش', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: الهند\nالاسم الكامل (بالحروف اللاتينية): MANOJ SABHARWAL OM PRAKASH\nمكان الميلاد: الهند\nالنوع: الرقم الموحد\nرقم الوثيقة: 4415541\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (83) لسنة 2021\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (24) لسنة 2024', 'شخص إرهابي', NULL, '2025-10-31 00:25:26'),
(316, 'عبده عبد الله دائل احمد', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - أفراد\nالتصنيف: شخص إرهابي\nالجنسية: اليمن\nالاسم الكامل (بالحروف اللاتينية): ABDO ABDULLAH DAEL AHMED\nتاريخ الميلاد: 1979-09-12\nمكان الميلاد: تعز المخا\nالنوع: جواز سفر\nرقم الوثيقة: 8948884\nجهة الإصدار: اليمن\nتاريخ الإصدار: 2020-06-03\nتاريخ الانتهاء: 2026-06-03\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (13) لسنة 2022\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (48) لسنة 2024', 'شخص إرهابي', NULL, '2025-10-31 00:25:26'),
(317, 'CANVAS : CENTER FOR APPLIED NONVIOLENT ACTION AND STRATEGIES', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: منظمة كانفاس في صربيا/ بلجراد\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (41) لسنة 2014\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:27'),
(318, 'QATAR VOLUNTEER CENTER', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: مركز قطر للعمل التطوعي (قطر)\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:28'),
(319, 'DOHA APPLE', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: شركة دوحة أبل (شركت إنترنت ودعم تكنولوجي (قطر)\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:28'),
(320, 'QATAR CHARITY', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: قطر الخيرية (قطر)\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:29'),
(321, 'EID CHARITY', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة الشيخ عيد آل ثاني الخيرية (قطر)\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:30'),
(322, 'SHEIKH THANI BIN ABDULLAH FOUNDATION FOR HUMANITARIAN SERVICE', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة الشيخ ثاني بن عبد الله للخدمات الإنسانية (قطر)\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (18) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:30'),
(323, 'AL-BALAGH CHARITABLE FOUNDATION', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: مؤسسة البلاغ الخيرية\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:31'),
(324, 'AL-IHSAN CHARITABLE SOCIETY', NULL, 'compliant', 'مصدر القائمة: رفع الإدراج - كيانات\nالتصنيف: كيان إرهابي\nالاسم: جمعية الإحسان الخيرية\nقرار الإدراج: مدرج بموجب قرار مجلس الوزراء رقم (28) لسنة 2017\nقرار رفع الإدراج: رفع الإدراج بموجب قرار مجلس الوزراء رقم (88) لسنة 2023', 'كيان إرهابي', NULL, '2025-10-31 00:25:31');

-- --------------------------------------------------------

--
-- بنية الجدول `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `invoice_date` date NOT NULL,
  `branch_id` int DEFAULT NULL,
  `invoice_number` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL DEFAULT '0.00',
  `client_id` int DEFAULT NULL,
  `bank_account_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `currency` varchar(10) DEFAULT 'AED',
  `vat` decimal(5,2) DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `invoices`
--

INSERT INTO `invoices` (`id`, `invoice_date`, `branch_id`, `invoice_number`, `amount`, `client_id`, `bank_account_id`, `created_at`, `created_by`, `status`, `currency`, `vat`) VALUES
(8, '2025-11-01', 2, 'INV-2025-00008', '210.00', 77, NULL, '2025-11-01 13:49:28', 90, 'approved', 'AED', '5.00'),
(9, '2025-11-02', 3, 'INV-2025-00009', '221.55', 77, 1, '2025-11-02 16:49:38', 90, 'rejected', 'AED', '5.00'),
(10, '2025-11-04', 3, 'INV-2025-00010', '4000.00', 79, 1, '2025-11-04 07:57:30', 90, 'approved', 'AED', '0.00');

-- --------------------------------------------------------

--
-- بنية الجدول `invoice_attachments`
--

CREATE TABLE `invoice_attachments` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `attachment_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `attachment_name` varchar(1055) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(12, 8, 'test', '200.00'),
(13, 9, '211', '211.00'),
(14, 10, 'عدد 2 استشارة قانونية', '4000.00');

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
(20, 142, '2025-09-02', 'pending', 1, '15', 1, '2025-10-13 10:41:40'),
(24, 160, '2025-10-29', 'pending', 1, '7', 0, '2025-11-01 14:44:04');

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
-- بنية الجدول `legal_periods`
--

CREATE TABLE `legal_periods` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `objection_days` int DEFAULT NULL,
  `appeal_days` int DEFAULT NULL,
  `cassation_days` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `legal_periods`
--

INSERT INTO `legal_periods` (`id`, `name`, `objection_days`, `appeal_days`, `cassation_days`, `created_at`, `created_by`) VALUES
(1, 'التجارية والمدنية والعمالية اقل من 500,000 درهم', NULL, 30, NULL, '2025-10-29 02:45:41', NULL),
(2, 'التجارية والمدنية والعمالية اقل من 500,000 درهم', NULL, 30, NULL, '2025-10-29 02:58:20', NULL),
(3, 'التجارية والمدنية والعمالية اكثر من 500,000 درهم', NULL, 30, 30, '2025-10-29 03:27:04', NULL),
(4, 'الدعاوى المستعجلة ', NULL, 10, NULL, '2025-10-29 04:03:35', NULL),
(5, ' القضايا الجزائية', NULL, 15, 15, '2025-10-29 04:31:42', NULL),
(6, 'القضايا الجزائية', NULL, 15, 30, '2025-10-30 06:08:30', NULL),
(7, 'دعاوى الاحوال الشخصية', NULL, 30, 30, '2025-10-30 06:09:05', NULL),
(8, 'التجربة اليدوية', NULL, 8, NULL, '2025-10-30 16:15:43', NULL);

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

--
-- إرجاع أو استيراد بيانات الجدول `logs`
--

INSERT INTO `logs` (`id`, `employee_id`, `action`, `description`, `created_at`) VALUES
(142, 90, 'add', 'أضاف موظف: رزان (ID: 117)', '2025-10-30 00:09:34'),
(143, 90, 'add', 'أضاف موظف: Nour qandil (ID: 118)', '2025-10-30 00:13:03'),
(144, 90, 'add', 'أضاف موظف: Umar usman (ID: 119)', '2025-10-30 00:15:12'),
(145, 90, 'add', 'أضاف حدث: اجتماع مع فريق عمل المستكشف (ID: 3)', '2025-10-30 00:25:47'),
(146, 90, 'update', 'حدّث حدث: اجتماع مع فريق عمل المستكشف (ID: 3)', '2025-10-30 00:26:11'),
(147, 90, 'update', 'حدّث حدث: اجتماع مع فريق عمل المستكشف (ID: 3)', '2025-10-30 00:26:44'),
(148, 90, 'update', 'حدّث حدث: اجتماع مع فريق عمل المستكشف (ID: 3)', '2025-10-30 00:27:15'),
(149, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 00:42:33'),
(150, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:07:42'),
(151, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:08:14'),
(152, 119, 'login', 'تسجيل دخول: Umar usman', '2025-10-30 01:08:31'),
(153, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:09:10'),
(154, 90, 'update', 'حدّث موظف: Ashly Philip (ID: 114)', '2025-10-30 01:10:50'),
(155, 119, 'login', 'تسجيل دخول: Umar usman', '2025-10-30 01:11:14'),
(156, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:12:31'),
(157, 90, 'update', 'حدّث موظف: Umar usman (ID: 119)', '2025-10-30 01:13:10'),
(158, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:13:37'),
(159, 119, 'login', 'تسجيل دخول: Umar usman', '2025-10-30 01:13:55'),
(160, 119, 'login', 'تسجيل دخول: Umar usman', '2025-10-30 01:15:23'),
(161, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:15:45'),
(162, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:18:24'),
(163, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 01:28:03'),
(164, 90, 'add', 'أضاف حدث: test (ID: 4)', '2025-10-30 02:39:31'),
(165, 80, 'login', 'تسجيل دخول: مروى مسعد', '2025-10-30 02:40:14'),
(166, 80, 'login', 'تسجيل دخول: مروى مسعد', '2025-10-30 02:40:40'),
(167, 90, 'delete', 'حذف حدث: اجتماع مع فريق عمل المستكشف (ID: 3)', '2025-10-30 02:41:21'),
(168, 90, 'add', 'أضاف حدث: test (ID: 5)', '2025-10-30 02:42:09'),
(169, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 02:46:54'),
(170, 90, 'delete', 'حذف طرف: y878 (ID: 70)', '2025-10-30 02:47:14'),
(171, 90, 'add', 'أضاف طرف: 322e2 (ID: 71)', '2025-10-30 04:30:18'),
(172, 90, 'delete', 'حذف اجتماع: اجتماع (ID: 15)', '2025-10-30 04:46:38'),
(173, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 04:48:52'),
(174, 90, 'delete', 'حذف طرف: 322e2 (ID: 71)', '2025-10-30 04:51:54'),
(175, 90, 'add', 'أضاف طرف: ytrr (ID: 72)', '2025-10-30 04:52:24'),
(176, 90, 'add', 'أضاف طرف: hgf (ID: 73)', '2025-10-30 04:59:01'),
(177, 90, 'add', 'أضاف طرف: brgbgrf (ID: 74)', '2025-10-30 04:59:48'),
(178, 90, 'delete', 'حذف طرف: brgbgrf (ID: 74)', '2025-10-30 04:59:56'),
(179, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 05:50:20'),
(180, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:29:51'),
(181, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:34:44'),
(182, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:35:34'),
(183, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:42:15'),
(184, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:42:30'),
(185, 117, 'login', 'تسجيل دخول: رزان', '2025-10-30 06:50:26'),
(186, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 06:52:01'),
(187, 97, 'login', 'تسجيل دخول: ali', '2025-10-30 06:54:53'),
(188, 97, 'login', 'تسجيل دخول: ali', '2025-10-30 06:59:52'),
(189, 97, 'login', 'تسجيل دخول: ali', '2025-10-30 07:25:15'),
(190, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 09:38:37'),
(191, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 09:39:35'),
(192, 90, 'add', 'أضاف مهمة: test (ID: 51)', '2025-10-30 10:07:18'),
(193, 90, 'update', 'حدّث مهمة: test (ID: 51)', '2025-10-30 10:08:26'),
(194, 97, 'login', 'تسجيل دخول: ali', '2025-10-30 10:10:44'),
(195, 97, 'update', 'حدّث مهمة: test (ID: 51)', '2025-10-30 10:12:44'),
(196, 90, 'update', 'حدّث مهمة: test (ID: 51)', '2025-10-30 10:15:10'),
(197, 90, 'add', 'أضاف طرف: حسين عبد اللطيف (ID: 75)', '2025-10-30 10:45:44'),
(198, 90, 'add', 'أضاف قضية: 123456789 (ID: 158)', '2025-10-30 10:48:24'),
(199, 90, 'add', 'أضاف مهمة: تسجيل الدعوى في المحكمة (ID: 52)', '2025-10-30 10:48:25'),
(200, 90, 'update', 'حدّث قضية: 20251030104824 (ID: 158)', '2025-10-30 10:49:07'),
(201, 90, 'update', 'حدّث طرف: حسين عبد اللطيف (ID: 75)', '2025-10-30 10:54:00'),
(202, 90, 'update', 'حدّث موظف: رزان (ID: 117)', '2025-10-30 10:54:22'),
(203, 117, 'login', 'تسجيل دخول: رزان', '2025-10-30 10:56:18'),
(204, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 11:51:54'),
(205, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 11:57:03'),
(206, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 12:00:36'),
(207, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 16:02:19'),
(208, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 16:04:18'),
(209, 90, 'add', 'أضاف جلسة: جلسة جديدة (ID: 85)', '2025-10-30 16:15:59'),
(210, 90, 'add', 'أضاف محفظة: محفظة جديدة', '2025-10-30 16:40:04'),
(211, 90, 'add', 'أضاف إيداع محفظة: إيداع بمبلغ 12000', '2025-10-30 16:41:53'),
(212, 90, 'add', 'أضاف فاتورة: فاتورة رقم جديدة (ID: 6)', '2025-10-30 16:44:53'),
(213, 90, 'add', 'أضاف فاتورة: فاتورة رقم جديدة (ID: 7)', '2025-10-30 16:45:53'),
(214, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 17:36:12'),
(215, 90, 'login', 'تسجيل دخول: admin', '2025-10-30 17:37:15'),
(216, 97, 'login', 'تسجيل دخول: ali', '2025-10-31 00:47:19'),
(217, 90, 'add', 'أضاف مهمة: rtrfdddd43 (ID: 53)', '2025-10-31 00:51:41'),
(218, 90, 'add', 'أضاف مهمة: قفبثيءس (ID: 54)', '2025-10-31 00:58:15'),
(219, 90, 'update', 'حدّث مهمة: قفبثيءس (ID: 54)', '2025-10-31 00:59:26'),
(220, 97, 'update', 'حدّث مهمة: قفبثيءس (ID: 54)', '2025-10-31 01:01:21'),
(221, 97, 'update', 'حدّث قضية: 20251030104824 (ID: 158)', '2025-10-31 01:16:24'),
(222, 97, 'update', 'حدّث قضية: 20251030104824 (ID: 158)', '2025-10-31 01:18:55'),
(223, 97, 'delete', 'حذف قضية: 20251029170824 (ID: 154)', '2025-10-31 01:24:26'),
(224, 97, 'delete', 'حذف قضية: 20251028093933 (ID: 152)', '2025-10-31 01:27:48'),
(225, 97, 'delete', 'حذف قضية: 20251029171340 (ID: 155)', '2025-10-31 01:29:53'),
(226, 90, 'login', 'تسجيل دخول: admin', '2025-10-31 17:28:05'),
(227, 90, 'login', 'تسجيل دخول: admin', '2025-10-31 19:14:37'),
(228, 90, 'login', 'تسجيل دخول: admin', '2025-11-01 05:21:35'),
(229, 90, 'login', 'تسجيل دخول: admin', '2025-11-01 05:56:38'),
(230, 90, 'add', 'أضاف طرف: سعود احمد مراد علي الهاشمي (ID: 76)', '2025-11-01 06:23:16'),
(231, 90, 'add', 'أضاف طرف: 	شيخة اسحاق مراد علي الهاشمي (ID: 77)', '2025-11-01 06:25:03'),
(232, 90, 'add', 'أضاف قضية: 1904 (ID: 159)', '2025-11-01 06:26:36'),
(233, 90, 'add', 'أضاف جلسة: جلسة جديدة (ID: 86)', '2025-11-01 06:26:38'),
(234, 90, 'add', 'أضاف مهمة: كتابه مذكرة  (ID: 55)', '2025-11-01 06:26:40'),
(235, 90, 'add', 'أضاف جلسة: جلسة جديدة (ID: 87)', '2025-11-01 06:30:33'),
(236, 102, 'login', 'تسجيل دخول: شريف ', '2025-11-01 06:39:25'),
(237, 90, 'delete', 'حذف مهمة: rtrfdddd43 (ID: 53)', '2025-11-01 09:53:05'),
(238, 90, 'add', 'أضاف فاتورة: فاتورة رقم جديدة (ID: 8)', '2025-11-01 13:49:29'),
(239, 90, 'update', 'حدّث فاتورة: فاتورة رقم 8 (ID: 8)', '2025-11-01 14:32:25'),
(240, 90, 'add', 'أضاف طرف: عمران محمد عباس (ID: 78)', '2025-11-01 14:34:28'),
(241, 90, 'add', 'أضاف طرف: علي نخند (ID: 79)', '2025-11-01 14:35:49'),
(242, 90, 'add', 'أضاف قضية: 1150 (ID: 160)', '2025-11-01 14:43:57'),
(243, 90, 'add', 'أضاف جلسة: جلسة جديدة (ID: 88)', '2025-11-01 14:44:02'),
(244, 90, 'add', 'أضاف مهمة: تصوير (ID: 56)', '2025-11-01 14:44:04'),
(245, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00005 (ID: 5)', '2025-11-01 15:01:29'),
(246, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00004 (ID: 4)', '2025-11-01 15:01:38'),
(247, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00002 (ID: 2)', '2025-11-01 15:01:46'),
(248, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00003 (ID: 3)', '2025-11-01 15:01:57'),
(249, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00006 (ID: 6)', '2025-11-01 15:02:05'),
(250, 90, 'delete', 'حذف فاتورة: فاتورة رقم INV-2025-00007 (ID: 7)', '2025-11-01 15:02:17'),
(251, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 2000 (ID: 1)', '2025-11-01 16:19:12'),
(252, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 800 (ID: 2)', '2025-11-01 21:18:27'),
(253, 90, 'update', 'حدّث عهدة موظف: تعديل عهدة بمبلغ 800.00 (ID: 2)', '2025-11-01 21:26:01'),
(254, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 200 (ID: 3)', '2025-11-01 21:39:45'),
(255, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 200 (ID: 4)', '2025-11-01 21:54:42'),
(256, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 400 (ID: 5)', '2025-11-01 21:55:01'),
(257, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 200 (ID: 6)', '2025-11-01 22:13:14'),
(258, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 200 (ID: 7)', '2025-11-01 23:30:25'),
(259, 90, 'login', 'تسجيل دخول: admin', '2025-11-02 04:21:12'),
(260, 102, 'login', 'تسجيل دخول: شريف ', '2025-11-02 04:24:28'),
(261, 102, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-02 04:27:25'),
(262, 90, 'delete', 'حذف مصروفات موظف: حذف مصروف بمبلغ 200.00 (ID: 6)', '2025-11-02 09:36:03'),
(263, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 100 (ID: 8)', '2025-11-02 10:09:52'),
(264, 90, 'update', 'حدّث مصروفات موظف: تعديل مصروف بمبلغ 10 (ID: 8)', '2025-11-02 10:10:08'),
(265, 90, 'update', 'حدّث فاتورة: فاتورة رقم 8 (ID: 8)', '2025-11-02 12:05:23'),
(266, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 200 (ID: 9)', '2025-11-02 12:22:40'),
(267, 90, 'update', 'حدّث عهدة موظف: تعديل عهدة بمبلغ 2100 (ID: 9)', '2025-11-02 12:46:04'),
(268, 90, 'update', 'حدّث مصروفات موظف: تعديل مصروف بمبلغ 20 (ID: 8)', '2025-11-02 12:46:32'),
(269, 90, 'update', 'حدّث عهدة موظف: تعديل عهدة بمبلغ 210 (ID: 9)', '2025-11-02 12:46:48'),
(270, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 200 (ID: 10)', '2025-11-02 14:06:23'),
(271, 90, 'login', 'تسجيل دخول: admin', '2025-11-02 16:07:28'),
(272, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 211 (ID: 11)', '2025-11-02 16:25:28'),
(273, 90, 'update', 'حدّث موظف: فضل ناصر (ID: 91)', '2025-11-02 16:29:08'),
(274, 91, 'login', 'تسجيل دخول: فضل ناصر', '2025-11-02 16:29:35'),
(275, 90, 'update', 'حدّث عهدة موظف: تعديل عهدة بمبلغ 3221 (ID: 11)', '2025-11-02 16:30:17'),
(276, 90, 'add', 'أضاف فاتورة: فاتورة رقم جديدة (ID: 9)', '2025-11-02 16:49:40'),
(277, 90, 'update', 'حدّث فاتورة: فاتورة رقم 9 (ID: 9)', '2025-11-02 16:49:59'),
(278, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 400 (ID: 12)', '2025-11-02 20:08:51'),
(279, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 300 (ID: 13)', '2025-11-02 20:09:09'),
(280, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 10 (ID: 14)', '2025-11-02 20:09:32'),
(281, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 4000 (ID: 15)', '2025-11-02 20:10:13'),
(282, 90, 'add', 'أضاف عهدة موظف: إضافة عهدة بمبلغ 5000 (ID: 16)', '2025-11-02 20:10:36'),
(283, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 400 (ID: 17)', '2025-11-02 20:10:54'),
(284, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 39 (ID: 18)', '2025-11-02 20:11:12'),
(285, 90, 'login', 'تسجيل دخول: admin', '2025-11-03 03:15:33'),
(286, 90, 'login', 'تسجيل دخول: admin', '2025-11-03 09:55:41'),
(287, 90, 'login', 'تسجيل دخول: admin', '2025-11-03 10:24:15'),
(288, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 299 (ID: 19)', '2025-11-03 11:03:35'),
(289, 90, 'update', 'حدّث مصروفات موظف: تعديل مصروف بمبلغ 29 (ID: 19)', '2025-11-03 11:10:00'),
(290, 90, 'add', 'أضاف مصروفات موظف: إضافة مصروف بمبلغ 211 (ID: 20)', '2025-11-03 12:53:46'),
(291, 90, 'add', 'أضاف عهدة موظف: خصم عهدة بمبلغ 211 (ID: 21)', '2025-11-03 13:26:26'),
(292, 90, 'add', 'أضاف محفظة: محفظة جديدة', '2025-11-04 07:38:05'),
(293, 90, 'add', 'أضاف إيداع محفظة: إيداع بمبلغ 10000', '2025-11-04 07:38:57'),
(294, 90, 'add', 'أضاف مصروف محفظة: مصروف بمبلغ 1312.50 - فاتورة رقم INV-2025-000014 (ID: 14)', '2025-11-04 07:49:28'),
(295, 90, 'add', 'أضاف فاتورة: فاتورة رقم جديدة (ID: 10)', '2025-11-04 07:57:30'),
(296, 90, 'update', 'حدّث فاتورة: فاتورة رقم 10 (ID: 10)', '2025-11-04 07:59:11'),
(298, 90, 'add', 'أضاف طرف: حسن حسن (ID: 80)', '2025-11-04 09:43:54'),
(299, 90, 'login', 'تسجيل دخول: admin', '2025-11-04 09:49:28'),
(302, 90, 'add', 'أضاف طرف: نايف (ID: 81)', '2025-11-04 11:44:28'),
(303, 90, 'add', 'أضاف طرف: test (ID: 82)', '2025-11-04 11:48:49'),
(304, 90, 'add', 'أضاف اجتماع: اجتماع جديد (ID: 18)', '2025-11-04 12:00:59'),
(305, 90, 'delete', 'حذف اجتماع: اجتماع (ID: 18)', '2025-11-04 12:01:16'),
(306, 90, 'add', 'أضاف اجتماع: اجتماع جديد (ID: 19)', '2025-11-04 12:06:38'),
(307, 90, 'delete', 'حذف اجتماع: اجتماع (ID: 19)', '2025-11-04 12:07:25'),
(308, 90, 'login', 'تسجيل دخول: admin', '2025-11-04 15:22:14'),
(309, 97, 'login', 'تسجيل دخول: ali', '2025-11-04 16:21:16'),
(310, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 08:02:05'),
(311, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 08:56:13'),
(312, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 08:56:16'),
(313, 90, 'add', 'أضاف محفظة: محفظة جديدة', '2025-11-05 09:22:15'),
(314, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 12:37:22'),
(315, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 12:42:35'),
(316, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 13:39:11'),
(317, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:41:20'),
(318, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:41:43'),
(319, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:42:52'),
(320, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:55:19'),
(321, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:55:29'),
(322, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 14:58:40'),
(323, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 15:00:44'),
(324, 90, 'update', 'حدّث قضية: 20251101062636 (ID: 159)', '2025-11-05 15:01:04'),
(325, 90, 'login', 'تسجيل دخول: admin', '2025-11-05 17:38:02'),
(326, 97, 'login', 'تسجيل دخول: ali', '2025-11-05 17:38:47');

-- --------------------------------------------------------

--
-- بنية الجدول `meetings`
--

CREATE TABLE `meetings` (
  `id` int NOT NULL,
  `party_id` int NOT NULL,
  `note` text,
  `date` date NOT NULL,
  `link` varchar(500) DEFAULT NULL,
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

INSERT INTO `meetings` (`id`, `party_id`, `note`, `date`, `link`, `start_time`, `end_time`, `meeting_type`, `address`, `lawyer_id`, `meet_result`, `created_at`, `created_by`) VALUES
(16, 59, 'test', '2025-10-21', NULL, '13:00:00', '13:01:00', 'onsite', 'Dubai', NULL, 'cancelled', '2025-10-21 14:55:12', NULL),
(17, 61, NULL, '2025-10-23', NULL, '08:05:00', '08:49:00', 'onsite', NULL, NULL, 'scheduled', '2025-10-22 12:05:31', NULL);

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
(41, 143, 'مذكرة جوابيه رقم 1', '2025-10-31', 'مذكرة جوابيه ', 0, 0, 0, 0, 105, 'Pending Approval', 'مررها للاستاذ شريف للمراجعة ', '2025-10-15 15:50:35', 'Draft', 'Draft', 'Draft', 'Draft'),
(42, 143, 'مذكرة جوابيه ', '2025-10-28', 'مذكرة جوابيه ', 0, 0, 0, 0, 108, 'Pending Approval', 'مذكرة جوابيه ', '2025-10-15 16:00:56', 'Approved', 'Draft', 'Draft', 'Draft'),
(49, 144, 'مذكرة دفاع ', '2025-11-03', '', 0, 0, 0, 0, 90, 'Draft', '', '2025-11-01 06:33:12', 'Draft', 'Draft', 'Draft', 'Draft'),
(50, 160, 'اعداد مذكرة', '2025-11-03', '', 0, 0, 0, 0, 90, 'Approved', '', '2025-11-01 14:44:05', 'Draft', 'Draft', 'Draft', 'Draft'),
(51, 160, 'test33', '2025-11-11', '<h2 style=\"text-align: center;\"><strong>welcome</strong></h2><p></p>', 0, 0, 0, 0, 90, 'Pending Approval', '', '2025-11-04 15:40:28', 'Draft', 'Draft', 'Draft', 'Draft');

-- --------------------------------------------------------

--
-- بنية الجدول `memo_documents`
--

CREATE TABLE `memo_documents` (
  `id` int NOT NULL,
  `memo_id` int NOT NULL,
  `document_name` varchar(1055) NOT NULL,
  `document_url` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
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
(2, 114, '2025-10-20', '2025-10-27', '2025-11-01', 6, 24, 'paternity', 'paid', 90, '2025-10-20 11:03:06'),
(4, 95, '2025-10-01', '2025-11-01', '2025-11-05', 5, 25, 'emergency', 'unpaid', 90, '2025-10-29 22:44:45');

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
  `nationality` varchar(55) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `parties`
--

INSERT INTO `parties` (`id`, `name`, `phone`, `address`, `branch_id`, `category`, `email`, `party_type`, `passport`, `username`, `password`, `status`, `is_vip`, `created_by`, `created_at`, `e_id`, `source`, `consultation_type`, `nationality`, `balance`) VALUES
(11, ' أحمد علي', ' +971501234567', ' شارع الملك، دبيlisfhjgoijog', 1, 'individual', ' ahmed.ali@example.com', 'client', NULL, ' ahmed.ali', ' securepassword123', 'active', 0, NULL, '2025-09-19 22:15:30', NULL, NULL, NULL, 'اليمن', NULL),
(15, 'ماهر الكتبي', ' +971501234567', ' شارع الملك، دبيlisfhjgoijog', 1, 'individual', ' ahmed.ali@exasmple.comd', 'client', NULL, ' wdffs.ali', ' securepassword123', 'active', 0, NULL, '2025-09-19 22:17:34', '654321`', NULL, NULL, 'اليمن', NULL),
(16, 'عبدالله سعيد', '+971501455918', 'ابو هيل\n111', 1, 'individual', 'thman.saleh@gmail.com', 'client', '', 'othman', 'othman', 'active', 0, NULL, '2025-09-21 05:05:53', '7654321', NULL, '', 'hgrrr', NULL),
(17, 'منتصر خلف الله', '+9715014455918', 'ابو هيل\n111', 1, 'company', 'thman.saleh@gmail.com', 'opponent', NULL, '432', 'othman', 'active', 0, NULL, '2025-09-21 05:09:23', '7654321', NULL, NULL, 'hgrrr', NULL),
(18, 'خالد المري', '+971501455918', 'dubai deirah', 1, 'company', 'ahmed.ali@example.com', 'opponent', NULL, 'khiled', 'othman', 'active', 0, NULL, '2025-09-21 05:40:47', '7654321', NULL, NULL, 'الامارات', NULL),
(19, 'مروان علي', '+971501455918', 'دبي ديرة', 1, 'individual', 'john.doe@example.com', 'opponent', NULL, '77168', '4333', 'inactive', 0, NULL, '2025-09-21 13:37:57', '76543216543', NULL, NULL, 'العراق', NULL),
(20, 'عثمان صالح عبدالحميد', '0501455918', 'ابو هيل\n111', 1, 'company', '322', 'client', NULL, 'admin', '123456', 'active', 0, NULL, '2025-09-30 10:41:07', '', NULL, NULL, '22', NULL),
(22, 'عثمان صالح عبدالحميد', '0501455918', 'ابو هيل\n111', 1, 'company', 'john.smith@email.com', 'opponent', NULL, 'tgref', '123456', 'active', 0, NULL, '2025-09-30 10:43:50', '2121', NULL, NULL, 'hgrrr', NULL),
(30, 'حمدان رائد', '0501455918', '', 2, 'company', 'hamdan@gmail.com', 'opponent', NULL, '765432', '654333', 'active', 0, NULL, '2025-10-08 00:55:52', '', NULL, NULL, '', NULL),
(31, 'ali nour', '+971501455918', 'مريننا', 2, 'individual', '', 'opponent', NULL, '981539', '457298', 'active', 0, NULL, '2025-10-08 11:43:54', '', NULL, NULL, '', NULL),
(32, 'طلال محمد', '0501455918', NULL, 2, 'individual', NULL, 'client', NULL, '812983', '574829', 'active', 0, NULL, '2025-10-08 12:43:58', NULL, NULL, NULL, NULL, NULL),
(33, 'othman', '050123567', '9ouied', 3, 'company', '', 'New', '', '86754tr', 'iuyjhtgrfre', 'active', 0, NULL, '2025-10-08 23:35:27', '', 'زيارة المكتب', 'مالية', '', NULL),
(39, 'عثمان صالح عبدالحميد', '+971501455918', 'ابو هيل\n111', 2, 'company', '', 'opponent', NULL, '957346', '702194', 'active', 0, NULL, '2025-10-09 01:34:52', '', NULL, NULL, '', NULL),
(52, 'المستكشف للتطوير و الرصد الاعلامي', '0585952035', '', 1, 'company', 'rased@almstkshf.com', 'client', '', '843844', '649044', 'active', 1, 90, '2025-10-13 10:31:33', '', NULL, '', '', NULL),
(53, 'محمد حماد', '0585454541', '', 1, 'individual', '', 'opponent', NULL, '639350', '526704', 'active', 0, 90, '2025-10-13 10:32:26', '', NULL, NULL, '', NULL),
(55, 'علي محمد ', '0501234567', '', 1, 'individual', 'ali@gmail.com', 'New', '', '139367', '653476', 'active', 0, 90, '2025-10-17 06:09:00', '', 'زيارة المكتب', 'قانونية', '', NULL),
(57, 'تامر يونس', '+971585400191', '', 3, 'individual', '', 'client', '', '250346', '419736', 'active', 1, 90, '2025-10-20 04:57:50', '784197941306025', NULL, '', 'مصري', NULL),
(58, 'شريف جمال ', '+971556829149', '', 3, 'individual', '', 'client', '', '779807', '980565', 'active', 0, 90, '2025-10-20 04:59:26', '', NULL, '', '', NULL),
(59, 'شريف 0 ', '+9715550000000', '', 1, 'individual', '', 'client', '', '665401', '345895', 'active', 0, 90, '2025-10-20 06:58:46', '', NULL, '', '', NULL),
(61, 'محمد حجي', '0097105555555', '', 3, 'individual', '', 'New', '', '835744', '676296', 'active', 0, 90, '2025-10-22 12:04:43', '', 'زيارة المكتب', '', '', NULL),
(63, 'احمد شاه البلوش ', '+971556829149', '', 1, 'individual', '', 'client', NULL, '362804', '503277', 'active', 0, 90, '2025-10-22 12:55:45', '', NULL, NULL, '', NULL),
(72, 'ytrr', '444444', '', 1, 'individual', '', 'client', '', '824018', '370004', 'active', 0, 90, '2025-10-30 04:52:24', '', NULL, '', '', NULL),
(73, 'hgf', '6543', '', 1, '', '', 'client', '', '781475', '184916', 'active', 0, 90, '2025-10-30 04:59:01', '', NULL, '', '', NULL),
(75, 'حسين عبد اللطيف', '05533221144', '', 1, 'individual', 'hussain@example.com', 'opponent', '87654', '244909', '417715', 'inactive', 0, 90, '2025-10-30 10:45:44', '', NULL, '', '', NULL),
(76, 'سعود احمد مراد علي الهاشمي', '055555555', '', 1, '', '', 'opponent', '', '239768', '721095', 'active', 0, 90, '2025-11-01 06:23:16', '', NULL, '', '', NULL),
(77, '	شيخة اسحاق مراد علي الهاشمي', '05011111111', '', 1, '', '', 'client', '', '903944', '291377', 'active', 0, 90, '2025-11-01 06:25:03', '', NULL, '', '', NULL),
(78, 'عمران محمد عباس', '0505012077', 'عجمان', 3, '', '', 'client', '', '972642', '342163', 'active', 0, 90, '2025-11-01 14:34:28', '', NULL, '', '', NULL),
(79, 'علي نخند', '', 'عجمان', 1, '', '', 'opponent', '', '165710', '979650', 'active', 0, 90, '2025-11-01 14:35:49', '', NULL, '', '', NULL),
(80, 'حسن حسن', '0505005001', '', 3, 'individual', '', 'New', '', '321111', '145086', 'inactive', 0, 90, '2025-11-04 09:43:54', '', 'الموقع الالكتروني', 'مالية', '', NULL),
(81, 'نايف', '0505073849834', '', 1, 'individual', '', 'New', '', '685411', '715385', 'active', 0, 90, '2025-11-04 11:44:28', '', 'زيارة المكتب', 'قانونية', '', NULL),
(82, 'test', '7890', '', 1, '', '', 'client', '', '447924', '259385', 'active', 0, 90, '2025-11-04 11:48:49', '', NULL, '', '', NULL);

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
-- بنية الجدول `parties_forms`
--

CREATE TABLE `parties_forms` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('welcome_message','price_quote') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(29, 52, 'موعد', '2025-10-25', 'pending', NULL, 'test', '2025-10-25 02:54:03', NULL),
(30, 20, 'استفسار مالي', '2025-10-27', 'pending', NULL, 'Test', '2025-10-27 13:17:10', NULL),
(31, 57, 'موعد', '2025-10-29', 'pending', NULL, 'ارغب في مقابلة الأستاذ محمد بني هاشم', '2025-10-29 23:36:58', NULL),
(32, 57, 'استفسار مالي', '2025-11-01', 'pending', '٨٧٦', 'ارغب في الحصول على كشف حساب', '2025-10-29 23:37:28', NULL),
(33, 57, 'طلب مستند', '2025-10-30', 'pending', NULL, 'Trgtrtrt', '2025-10-30 02:14:54', NULL),
(34, 20, 'تحديث حالة القضية', '2025-10-24', 'rejected', NULL, 'test oth man', '2025-10-30 03:08:53', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `permission_ar` varchar(100) NOT NULL,
  `permission_en` varchar(100) NOT NULL,
  `permission_parent_name` varchar(50) NOT NULL DEFAULT 'other',
  `permission_group_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `permissions`
--

INSERT INTO `permissions` (`id`, `permission_ar`, `permission_en`, `permission_parent_name`, `permission_group_name`, `created_at`) VALUES
(111, 'إضافة نموذج', 'Add Form', 'hr', 'forms', '2025-11-02 20:40:00'),
(114, 'حذف نموذج', 'Delete Form', 'hr', 'forms', '2025-11-02 20:40:00'),
(115, 'إضافة طلب موظف', 'Add Employee Request', 'hr', 'employee_requests', '2025-11-02 20:40:00'),
(116, 'عرض طلب موظف', 'View Employee Request', 'hr', 'employee_requests', '2025-11-02 20:40:00'),
(117, 'تعديل طلب موظف', 'Edit Employee Request', 'hr', 'employee_requests', '2025-11-02 20:40:00'),
(118, 'حذف طلب موظف', 'Delete Employee Request', 'hr', 'employee_requests', '2025-11-02 20:40:00'),
(119, 'إضافة حضور', 'Add Attendance', 'hr', 'attendance', '2025-11-02 20:40:00'),
(120, 'عرض الحضور', 'View Attendance', 'hr', 'attendance', '2025-11-02 20:40:00'),
(121, 'تعديل الحضور', 'Edit Attendance', 'hr', 'attendance', '2025-11-02 20:40:00'),
(122, 'حذف الحضور', 'Delete Attendance', 'hr', 'attendance', '2025-11-02 20:40:00'),
(135, 'إضافة تقييم', 'Add Review', 'hr', 'reviews', '2025-11-02 20:40:01'),
(136, 'عرض تقييم', 'View Review', 'hr', 'reviews', '2025-11-02 20:40:01'),
(137, 'تعديل تقييم', 'Edit Review', 'hr', 'reviews', '2025-11-02 20:40:01'),
(138, 'حذف تقييم', 'Delete Review', 'hr', 'reviews', '2025-11-02 20:40:01'),
(139, 'إضافة تدريب', 'Add Training', 'hr', 'trainings', '2025-11-02 20:40:01'),
(140, 'عرض تدريب', 'View Training', 'hr', 'trainings', '2025-11-02 20:40:01'),
(141, 'تعديل تدريب', 'Edit Training', 'hr', 'trainings', '2025-11-02 20:40:01'),
(142, 'حذف تدريب', 'Delete Training', 'hr', 'trainings', '2025-11-02 20:40:01'),
(143, 'إضافة خصم', 'Add Deduction', 'hr', 'deductions', '2025-11-02 20:40:01'),
(144, 'عرض خصم', 'View Deduction', 'hr', 'deductions', '2025-11-02 20:40:01'),
(145, 'تعديل خصم', 'Edit Deduction', 'hr', 'deductions', '2025-11-02 20:40:01'),
(146, 'حذف خصم', 'Delete Deduction', 'hr', 'deductions', '2025-11-02 20:40:01'),
(147, 'إضافة مستند موظف', 'Add Employee Document', 'hr', 'employee_documents', '2025-11-02 20:40:01'),
(150, 'حذف مستند موظف', 'Delete Employee Document', 'hr', 'employee_documents', '2025-11-02 20:40:01'),
(151, 'عرض تنبيهات الموارد البشرية', 'View HR Notifications', 'hr', 'hr_notifications', '2025-11-02 20:40:01'),
(156, 'إضافة ملف', 'Add Case', 'cases', 'cases', '2025-11-04 16:07:09'),
(157, 'عرض ملف', 'View Case', 'cases', 'cases', '2025-11-04 16:07:09'),
(158, 'تعديل ملف', 'Edit Case', 'cases', 'cases', '2025-11-04 16:07:09'),
(159, 'حذف ملف', 'Delete Case', 'cases', 'cases', '2025-11-04 16:07:09'),
(160, 'إضافة جلسة', 'Add Session', 'cases', 'sessions', '2025-11-04 16:07:09'),
(161, 'عرض جلسة', 'View Session', 'cases', 'sessions', '2025-11-04 16:07:09'),
(162, 'تعديل جلسة', 'Edit Session', 'cases', 'sessions', '2025-11-04 16:07:09'),
(163, 'حذف جلسة', 'Delete Session', 'cases', 'sessions', '2025-11-04 16:07:09'),
(164, 'إضافة مهمة', 'Add Task', 'cases', 'tasks', '2025-11-04 16:07:10'),
(165, 'عرض مهمة', 'View Task', 'cases', 'tasks', '2025-11-04 16:07:10'),
(166, 'تعديل مهمة', 'Edit Task', 'cases', 'tasks', '2025-11-04 16:07:10'),
(167, 'حذف مهمة', 'Delete Task', 'cases', 'tasks', '2025-11-04 16:07:10'),
(168, 'إضافة مذكرة', 'Add Memo', 'cases', 'memos', '2025-11-04 16:07:10'),
(169, 'عرض مذكرة', 'View Memo', 'cases', 'memos', '2025-11-04 16:07:10'),
(170, 'تعديل مذكرة', 'Edit Memo', 'cases', 'memos', '2025-11-04 16:07:10'),
(171, 'حذف مذكرة', 'Delete Memo', 'cases', 'memos', '2025-11-04 16:07:10'),
(172, 'إضافة عريضة', 'Add Petition', 'cases', 'petitions', '2025-11-04 16:07:10'),
(173, 'عرض عريضة', 'View Petition', 'cases', 'petitions', '2025-11-04 16:07:10'),
(174, 'تعديل عريضة', 'Edit Petition', 'cases', 'petitions', '2025-11-04 16:07:10'),
(175, 'حذف عريضة', 'Delete Petition', 'cases', 'petitions', '2025-11-04 16:07:10'),
(176, 'إضافة تنفيذ', 'Add Execution', 'cases', 'executions', '2025-11-04 16:07:10'),
(177, 'عرض تنفيذ', 'View Execution', 'cases', 'executions', '2025-11-04 16:07:10'),
(178, 'تعديل تنفيذ', 'Edit Execution', 'cases', 'executions', '2025-11-04 16:07:10'),
(179, 'حذف تنفيذ', 'Delete Execution', 'cases', 'executions', '2025-11-04 16:07:10'),
(180, 'إضافة أطراف القضية', 'Add Case Parties', 'cases', 'case_parties', '2025-11-04 16:07:11'),
(181, 'عرض أطراف القضية', 'View Case Parties', 'cases', 'case_parties', '2025-11-04 16:07:11'),
(182, 'تعديل أطراف القضية', 'Edit Case Parties', 'cases', 'case_parties', '2025-11-04 16:07:11'),
(183, 'حذف أطراف القضية', 'Delete Case Parties', 'cases', 'case_parties', '2025-11-04 16:07:11'),
(184, 'إضافة إشعار قضائي', 'Add Judicial Notice', 'cases', 'judicial_notices', '2025-11-04 16:07:11'),
(185, 'عرض إشعار قضائي', 'View Judicial Notice', 'cases', 'judicial_notices', '2025-11-04 16:07:11'),
(186, 'تعديل إشعار قضائي', 'Edit Judicial Notice', 'cases', 'judicial_notices', '2025-11-04 16:07:11'),
(187, 'حذف إشعار قضائي', 'Delete Judicial Notice', 'cases', 'judicial_notices', '2025-11-04 16:07:11'),
(192, 'إضافة نوع ملف جديد', 'Add Case Type', 'cases', 'case_types', '2025-11-04 16:07:11'),
(194, 'حذف نوع قضية', 'Delete Case Type', 'cases', 'case_types', '2025-11-04 16:07:11'),
(195, 'إضافة تصنيف ملف جديد', 'Add Case Classification', 'cases', 'case_classifications', '2025-11-04 16:07:12'),
(197, 'حذف تصنيف قضية', 'Delete Case Classification', 'cases', 'case_classifications', '2025-11-04 16:07:12'),
(198, 'إضافة درجة تقاضي', 'Add Court Degree', 'cases', 'case_degrees', '2025-11-04 16:07:12'),
(199, 'عرض درجة تقاضي', 'View Court Degree', 'cases', 'case_degrees', '2025-11-04 16:07:12'),
(200, 'تعديل درجة تقاضي', 'Edit Court Degree', 'cases', 'case_degrees', '2025-11-04 16:07:12'),
(201, 'حذف درجة تقاضي', 'Delete Court Degree', 'cases', 'case_degrees', '2025-11-04 16:07:12'),
(202, 'إضافة مستند للملف', 'Add Case Document', 'cases', 'case_documents', '2025-11-04 16:07:12'),
(205, 'حذف مستند من الملف', 'Delete Case Document', 'cases', 'case_documents', '2025-11-04 16:07:12'),
(206, 'إضافة موكل', 'Add Party', 'parties', 'parties', '2025-11-04 16:12:37'),
(207, 'عرض موكل', 'View Party', 'parties', 'parties', '2025-11-04 16:12:37'),
(208, 'تعديل موكل', 'Edit Party', 'parties', 'parties', '2025-11-04 16:12:37'),
(209, 'حذف موكل', 'Delete Party', 'parties', 'parties', '2025-11-04 16:12:37'),
(210, 'إضافة مستند موكل', 'Add Party Document', 'parties', 'party_documents', '2025-11-04 16:12:37'),
(213, 'حذف مستند طرف', 'Delete Party Document', 'parties', 'party_documents', '2025-11-04 16:12:37'),
(214, 'إضافة طلب للموكل', 'Add Party Order', 'parties', 'party_orders', '2025-11-04 16:12:38'),
(215, 'عرض طلبات الموكل', 'View Party Order', 'parties', 'party_orders', '2025-11-04 16:12:38'),
(216, 'تعديل طلب الموكل', 'Edit Party Order', 'parties', 'party_orders', '2025-11-04 16:12:38'),
(217, 'حذف طلب الموكل', 'Delete Party Order', 'parties', 'party_orders', '2025-11-04 16:12:38'),
(218, 'إضافة اجتماع', 'Add Meeting', 'parties', 'meetings', '2025-11-04 16:12:38'),
(219, 'عرض اجتماع', 'View Meeting', 'parties', 'meetings', '2025-11-04 16:12:38'),
(220, 'تعديل اجتماع', 'Edit Meeting', 'parties', 'meetings', '2025-11-04 16:12:38'),
(221, 'حذف اجتماع', 'Delete Meeting', 'parties', 'meetings', '2025-11-04 16:12:38'),
(222, 'إضافة اتفاقية', 'Add Deal', 'parties', 'client_deals', '2025-11-04 16:12:38'),
(223, 'عرض اتفاقية', 'View Deal', 'parties', 'client_deals', '2025-11-04 16:12:38'),
(224, 'تعديل اتفاقية', 'Edit Deal', 'parties', 'client_deals', '2025-11-04 16:12:38'),
(225, 'حذف اتفاقية', 'Delete Deal', 'parties', 'client_deals', '2025-11-04 16:12:38'),
(227, 'عرض الملفات', 'Show Cases', 'cases', 'cases', '2025-11-04 16:36:35'),
(228, 'عرض الاتفاقيات', 'View  Deals', 'parties', 'client_deals', '2025-11-04 16:12:38'),
(229, 'عرض طلبات الموكلين', 'View Parties Orders', 'parties', 'party_orders', '2025-11-04 16:12:38');

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
(25, 'شرظة مصفوت', 'شرطة الجرف', '2025-09-20 19:32:02'),
(26, 'مركز شرطة البرشاء', 'albrsha police station', '2025-10-30 01:40:27');

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
(3, 'نيابة دبي', 'Dubai Public Prosecution', '2025-09-18 06:19:16'),
(14, 'عجمان', 'ajman', '2025-10-27 04:57:00');

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
(3, 114, 'annual', '2025-10-20', 90, '2025-10-20 10:26:45'),
(6, 95, 'probation', '2025-10-01', 90, '2025-10-29 22:45:41');

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
(5, 6, 'corrected_system_architecture_Original.jpeg', 'https://lexcora.s3.us-east-2.amazonaws.com/reviews/1761777940441-py30kzq8s7s.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251029%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251029T224540Z&X-Amz-Expires=604800&X-Amz-Signature=2c40ed13a727c96fcb36f77313bf3d79f5cc472803724795f7d97e75a3a67f9b&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 90, '2025-10-29 22:45:41');

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
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `has_ruling` tinyint(1) DEFAULT '0',
  `ruling` text,
  `legal_period_id` int DEFAULT NULL,
  `ruling_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- إرجاع أو استيراد بيانات الجدول `sessions`
--

INSERT INTO `sessions` (`id`, `case_id`, `session_date`, `link`, `is_expert_session`, `decision`, `note`, `is_judgment_reserved`, `is_judgment_deferred`, `status`, `created_at`, `has_ruling`, `ruling`, `legal_period_id`, `ruling_date`) VALUES
(69, 143, '2025-10-15 20:00:00', 'Gmail.com', 1, 'تقديم مذكرة جوابيه', NULL, 1, 0, 'active', '2025-10-15 15:49:20', 1, 'test22', 2, '2025-10-24'),
(70, 144, '2025-10-28 08:00:00', NULL, 0, 'اول جلسة', NULL, 0, 0, 'active', '2025-10-17 06:36:59', 0, NULL, NULL, NULL),
(71, 139, '2025-10-15 20:36:00', NULL, 1, 'test', 'test', 0, 0, 'active', '2025-10-19 12:34:42', 0, NULL, NULL, NULL),
(74, 147, '2025-10-27 11:34:00', 'gmail.com', 1, '123', NULL, 0, 0, 'active', '2025-10-27 07:38:58', 0, NULL, NULL, NULL),
(75, 148, '2025-10-27 11:34:00', 'gmail.com', 1, '123', NULL, 0, 0, 'active', '2025-10-27 07:39:07', 0, NULL, NULL, NULL),
(76, 149, '2025-10-27 11:34:00', 'gmail.com', 1, '123', NULL, 0, 0, 'active', '2025-10-27 07:39:47', 0, NULL, NULL, NULL),
(84, 149, '2025-09-30 01:00:00', NULL, 1, NULL, NULL, 0, 0, 'active', '2025-10-29 05:35:30', 1, 'test', 3, '2025-10-01'),
(85, 147, '2025-11-05 09:00:00', 'www.almstkshf.com', 0, NULL, 'تجربة على الاضافة', 0, 0, 'active', '2025-10-30 16:15:59', 1, 'تجربة منطوق الحكم', 8, '2025-10-30'),
(86, 159, '2025-11-03 00:00:00', '', 0, 'احاله', NULL, 0, 0, 'active', '2025-11-01 06:26:38', 0, NULL, NULL, NULL),
(87, 159, '2025-11-08 11:00:00', NULL, 0, NULL, 'مذكرة ختامية', 0, 0, 'active', '2025-11-01 06:30:33', 0, NULL, NULL, NULL),
(88, 160, '2025-11-08 00:00:00', '', 0, 'اول جلسة', NULL, 0, 0, 'active', '2025-11-01 14:44:02', 0, NULL, NULL, NULL);

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
(2, 114, '2025-10-20', '2025-10-20', '2025-10-20', 1, 29, 'paid', 90, '2025-10-20 10:47:04'),
(3, 95, '2025-08-05', '2025-10-06', '2025-10-15', 10, 0, 'paid', 90, '2025-10-29 22:44:03');

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
(47, 'كتابه مذكرة ', 'كتابه مذكرة ', 102, 105, 144, 'urgent', 'pending', '2025-10-21', NULL, '2025-10-17 06:36:59'),
(51, 'test', 'test', 97, 90, NULL, 'normal', 'pending', '2025-10-25', NULL, '2025-10-30 10:07:17'),
(52, 'تسجيل الدعوى في المحكمة', 'تسجيل اوراق الدعوى و متابعة قرار القاضي', 117, 90, 158, 'urgent', 'pending', '2025-11-05', NULL, '2025-10-30 10:48:25'),
(54, 'قفبثيءس', 'فلقبثي', 97, 90, NULL, 'normal', 'completed', '2025-10-30', NULL, '2025-10-31 00:58:14'),
(55, 'كتابه مذكرة ', 'كتابه مذكرة ', 102, 90, 159, 'high', 'pending', '2025-11-03', NULL, '2025-11-01 06:26:40'),
(56, 'تصوير', 'تصوير الحكم', 104, 90, 160, 'urgent', 'pending', '2025-11-03', NULL, '2025-11-01 14:44:04');

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
(7, 40, 'تم عمل المذكرة اليوم', 90, '2025-10-05 22:41:01'),
(8, 51, 'hi', 90, '2025-10-30 10:07:57');

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

--
-- إرجاع أو استيراد بيانات الجدول `task_documents`
--

INSERT INTO `task_documents` (`id`, `task_id`, `document_url`, `document_name`, `created_at`, `uploaded_by`) VALUES
(30, 51, 'https://lexcora.s3.us-east-2.amazonaws.com/tasks/1761818892221-53kz54oeykv.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251030%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251030T100825Z&X-Amz-Expires=604800&X-Amz-Signature=7a29697dbe5a25328f0a5afd8e948a4c5763bc882ebffec77efd9f8629ffce1f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', '26.2025.pdf', '2025-10-30 10:08:26', NULL),
(31, 51, 'https://lexcora.s3.us-east-2.amazonaws.com/tasks/1761819157931-uyqt2jfdz9.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251030%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251030T101242Z&X-Amz-Expires=604800&X-Amz-Signature=20b03cfe0452489cf5c8ec8268669b000f62e12626376b1bf7fd2b9d1cd3552a&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 'IMG-20251025-WA0000.jpg', '2025-10-30 10:12:43', NULL),
(33, 55, 'https://lexcora.s3.us-east-2.amazonaws.com/tasks/1761978399791-7tv8utmzoao.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251101%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251101T062639Z&X-Amz-Expires=604800&X-Amz-Signature=ab1ef11179574c63e90c2dd6c4e035dccd512e30b4d9fd499d517220529e8a98&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 'ÙØ­Ø¶Ø± Ø¬ÙØ³Ù.pdf', '2025-11-01 06:26:40', NULL);

-- --------------------------------------------------------

--
-- بنية الجدول `test`
--

CREATE TABLE `test` (
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `test`
--

INSERT INTO `test` (`full_name`, `email`) VALUES
('test', 'tha@gmail.com'),
('ek3j', 'rf@ehfef.com'),
('ek3j', 'rf@ehfef.com'),
('yg', 'rh@reu.com'),
('yg', 'rh@reu.com'),
('iuhr', 'ij@huh.com'),
('test', 'edije@uhdi.com');

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
(4, 114, '2025-10-21', 'Vat Training ', 90, '2025-10-20 10:27:11'),
(5, 95, '2025-10-26', 'كيف تبهر مديرك', 90, '2025-10-29 22:49:05');

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

--
-- إرجاع أو استيراد بيانات الجدول `training_documents`
--

INSERT INTO `training_documents` (`id`, `training_id`, `document_name`, `document_url`, `created_by`, `created_at`) VALUES
(3, 5, 'user_project_mindmap_Original.jpeg', 'https://lexcora.s3.us-east-2.amazonaws.com/trainings/1761778144856-klpngi718qq.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAS4GY53D5CUSO22MU%2F20251029%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251029T224905Z&X-Amz-Expires=604800&X-Amz-Signature=8405778f7771819d443c2a59d7adc4a96a07c534910c278985ecf35892433dfe&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject', 90, '2025-10-29 22:49:05');

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
(3, 114, '2025-10-21', 'written', 'non compliance to office policies ', 90, '2025-10-20 10:27:41'),
(4, 95, '2025-10-26', 'verbal', 'فشل في إبهار مديرك', 90, '2025-10-29 22:49:45');

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
-- Indexes for table `appeals_cassations`
--
ALTER TABLE `appeals_cassations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `legal_period_id` (`legal_period_id`);

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
-- Indexes for table `case_types`
--
ALTER TABLE `case_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cash_transaction_attachments`
--
ALTER TABLE `cash_transaction_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`);

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
-- Indexes for table `employee_cash_transactions`
--
ALTER TABLE `employee_cash_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `client_id` (`client_id`);

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
  ADD KEY `created_by` (`created_by`),
  ADD KEY `i.branch_id` (`branch_id`),
  ADD KEY `bank_account_id` (`bank_account_id`);

--
-- Indexes for table `invoice_attachments`
--
ALTER TABLE `invoice_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `invoice_id` (`invoice_id`);

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
-- Indexes for table `legal_periods`
--
ALTER TABLE `legal_periods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

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
-- Indexes for table `parties_forms`
--
ALTER TABLE `parties_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_created_at` (`created_at`);

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
  ADD UNIQUE KEY `unique_role_permission` (`permission_ar`,`permission_en`),
  ADD KEY `idx_permissions_parent_name` (`permission_parent_name`),
  ADD KEY `idx_permissions_group_name` (`permission_group_name`);

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
  ADD KEY `idx_sessions_date` (`session_date`),
  ADD KEY `legal_period_id` (`legal_period_id`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appeals_cassations`
--
ALTER TABLE `appeals_cassations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `app_notifications`
--
ALTER TABLE `app_notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `call_logs`
--
ALTER TABLE `call_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `case_classifications`
--
ALTER TABLE `case_classifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `case_degrees`
--
ALTER TABLE `case_degrees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `case_documents`
--
ALTER TABLE `case_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_employees_documents`
--
ALTER TABLE `case_employees_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_parties`
--
ALTER TABLE `case_parties`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `case_parties_documents`
--
ALTER TABLE `case_parties_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `case_petitions`
--
ALTER TABLE `case_petitions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `case_petition_documents`
--
ALTER TABLE `case_petition_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `case_types`
--
ALTER TABLE `case_types`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `cash_transaction_attachments`
--
ALTER TABLE `cash_transaction_attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients_deals`
--
ALTER TABLE `clients_deals`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `courts`
--
ALTER TABLE `courts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `court_case_documents`
--
ALTER TABLE `court_case_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `deal_documents`
--
ALTER TABLE `deal_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `deductions`
--
ALTER TABLE `deductions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `employee_attendance`
--
ALTER TABLE `employee_attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `employee_cash_transactions`
--
ALTER TABLE `employee_cash_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `employee_documents`
--
ALTER TABLE `employee_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `employee_permissions`
--
ALTER TABLE `employee_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1260;

--
-- AUTO_INCREMENT for table `employee_requests`
--
ALTER TABLE `employee_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `event_attendance`
--
ALTER TABLE `event_attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `executions`
--
ALTER TABLE `executions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `executions_documents`
--
ALTER TABLE `executions_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `external_links`
--
ALTER TABLE `external_links`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `forms`
--
ALTER TABLE `forms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `goaml`
--
ALTER TABLE `goaml`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=325;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invoice_attachments`
--
ALTER TABLE `invoice_attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `judicial_orders`
--
ALTER TABLE `judicial_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `judicial_orders_documents`
--
ALTER TABLE `judicial_orders_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `legal_periods`
--
ALTER TABLE `legal_periods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `litigation_degrees`
--
ALTER TABLE `litigation_degrees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=327;

--
-- AUTO_INCREMENT for table `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `meetings_documents`
--
ALTER TABLE `meetings_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  MODIFY `attendance_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `memos`
--
ALTER TABLE `memos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `memo_documents`
--
ALTER TABLE `memo_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `other_leaves`
--
ALTER TABLE `other_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `parties`
--
ALTER TABLE `parties`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `parties_documents`
--
ALTER TABLE `parties_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `parties_forms`
--
ALTER TABLE `parties_forms`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `parties_orders`
--
ALTER TABLE `parties_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=230;

--
-- AUTO_INCREMENT for table `police_stations`
--
ALTER TABLE `police_stations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `public_prosecutions`
--
ALTER TABLE `public_prosecutions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `related_cases`
--
ALTER TABLE `related_cases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `review_documents`
--
ALTER TABLE `review_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `session_documents`
--
ALTER TABLE `session_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `sick_leaves`
--
ALTER TABLE `sick_leaves`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `task_documents`
--
ALTER TABLE `task_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `trainings`
--
ALTER TABLE `trainings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `training_documents`
--
ALTER TABLE `training_documents`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `warnings`
--
ALTER TABLE `warnings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- القيود للجدول `appeals_cassations`
--
ALTER TABLE `appeals_cassations`
  ADD CONSTRAINT `appeals_cassations_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appeals_cassations_ibfk_2` FOREIGN KEY (`legal_period_id`) REFERENCES `legal_periods` (`id`) ON DELETE CASCADE;

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
-- القيود للجدول `cash_transaction_attachments`
--
ALTER TABLE `cash_transaction_attachments`
  ADD CONSTRAINT `cash_transaction_attachments_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `employee_cash_transactions` (`id`) ON DELETE CASCADE;

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
-- القيود للجدول `employee_cash_transactions`
--
ALTER TABLE `employee_cash_transactions`
  ADD CONSTRAINT `employee_cash_transactions_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `employee_cash_transactions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `employee_cash_transactions_ibfk_3` FOREIGN KEY (`client_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_5` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_6` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- القيود للجدول `invoice_attachments`
--
ALTER TABLE `invoice_attachments`
  ADD CONSTRAINT `invoice_attachments_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `invoice_attachments_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
-- القيود للجدول `parties_forms`
--
ALTER TABLE `parties_forms`
  ADD CONSTRAINT `parties_forms_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sessions_ibfk_legal_period` FOREIGN KEY (`legal_period_id`) REFERENCES `legal_periods` (`id`) ON DELETE SET NULL;

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
