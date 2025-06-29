import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import request from 'graphql-request';
import { Container } from '../components/container';
import { Layout } from '../components/layout';
import HnButton from '../components/hn-button';
import { 
	PublicationFragment,
	PublicationByHostDocument,
	PublicationByHostQuery,
	PublicationByHostQueryVariables,
} from '../generated/graphql';
import { resizeImage } from '@starter-kit/utils/image';

const GQL_ENDPOINT = process.env.NEXT_PUBLIC_HASHNODE_GQL_ENDPOINT;

interface VerifyPageProps {
	publication: PublicationFragment;
}

export default function VerifyPage({ publication }: Readonly<VerifyPageProps>) {
	const router = useRouter();
	const [isVerifying, setIsVerifying] = useState(false);
	const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
	const [errorMessage, setErrorMessage] = useState<string>('');
	const { token, next } = router.query;

	const handleVerification = useCallback(async (verificationToken: string) => {
		setIsVerifying(true);
		setVerificationStatus('idle');
		setErrorMessage('');

		try {
			const response = await fetch('/api/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: verificationToken,
				}),
				credentials: 'include', // Quan trọng để nhận cookies
			});

			if (response.ok) {
				await response.json();
				
				// Cookies sẽ được set tự động từ response headers
				setVerificationStatus('success');
				
				// Điều hướng sau 2 giây
				setTimeout(() => {
					const redirectUrl = (next as string) || '/';
					router.push(redirectUrl);
				}, 2000);
			} else {
				const errorData = await response.json();
				setVerificationStatus('error');
				setErrorMessage(errorData.message ?? 'Xác thực thất bại');
			}
		} catch (error: unknown) {
			console.error('Verification error:', error);
			setVerificationStatus('error');
			setErrorMessage('Có lỗi xảy ra trong quá trình xác thực');
		} finally {
			setIsVerifying(false);
		}
	}, [next, router]);

	useEffect(() => {
		if (token && typeof token === 'string') {
			handleVerification(token);
		}
	}, [token, handleVerification]);

	const handleRetry = () => {
		if (token && typeof token === 'string') {
			handleVerification(token);
		}
	};

	return (
		<Layout>
			<Container className="px-4 py-8">
				<div className="max-w-md mx-auto">
					<div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 border border-neutral-200 dark:border-neutral-800">
						<div className="text-center">
							{/* Logo */}
							<div className="mb-6">
								{publication.preferences.logo ? (
									<Image
										src={resizeImage(publication.preferences.logo, { w: 80, h: 80 })}
										alt={publication.title}
										width={80}
										height={80}
										className="mx-auto rounded-full"
									/>
								) : (
									<div className="w-20 h-20 mx-auto bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
										<span className="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
											{publication.title.charAt(0)}
										</span>
									</div>
								)}
							</div>

							{/* Tiêu đề */}
							<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
								Xác thực tài khoản
							</h1>

							{/* Trạng thái xác thực */}
							{!token && (
								<div className="mb-6">
									<div className="text-red-600 dark:text-red-400 mb-4">
										⚠️ Không tìm thấy token xác thực
									</div>
									<p className="text-neutral-600 dark:text-neutral-400 text-sm">
										Vui lòng kiểm tra lại link xác thực từ email.
									</p>
								</div>
							)}

							{token && isVerifying && (
								<div className="mb-6">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
									<p className="text-neutral-600 dark:text-neutral-400">
										Đang xác thực...
									</p>
								</div>
							)}

							{verificationStatus === 'success' && (
								<div className="mb-6">
									<div className="text-green-600 text-4xl mb-4">✅</div>
									<h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
										Xác thực thành công!
									</h2>
									<p className="text-neutral-600 dark:text-neutral-400 text-sm">
										Bạn sẽ được chuyển hướng trong giây lát...
									</p>
								</div>
							)}

							{verificationStatus === 'error' && (
								<div className="mb-6">
									<div className="text-red-600 text-4xl mb-4">❌</div>
									<h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
										Xác thực thất bại
									</h2>
									<p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
										{errorMessage}
									</p>
									<HnButton
										onClick={handleRetry}
										disabled={isVerifying}
										className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
									>
										Thử lại
									</HnButton>
								</div>
							)}

							{/* Link về trang chủ */}
							<div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
								<HnButton
									onClick={() => router.push('/')}
									variant="transparent"
									className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
								>
									← Về trang chủ
								</HnButton>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</Layout>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { token } = context.query;

	// Nếu không có token, vẫn render page để hiển thị thông báo lỗi
	if (!token) {
		console.warn('Verify page accessed without token');
	}

	try {
		const data = await request<PublicationByHostQuery, PublicationByHostQueryVariables>(
			GQL_ENDPOINT,
			PublicationByHostDocument,
			{
				host: process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST,
			},
		);

		const publication = data.publication;
		if (!publication) {
			return {
				notFound: true,
			};
		}

		return {
			props: {
				publication,
			},
		};
	} catch (error) {
		console.error('Error fetching publication:', error);
		return {
			notFound: true,
		};
	}
};